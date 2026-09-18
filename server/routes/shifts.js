const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// Helper to calculate real-time shift stats
async function getShiftMetrics(shiftId) {
  const shift = await db.prepare(`
    SELECT s.*, u.full_name as cashier_name, u.username as cashier_username
    FROM shifts s
    JOIN users u ON s.cashier_id = u.id
    WHERE s.id = ?
  `).get(shiftId);

  if (!shift) return null;

  // 1. Sales inside this shift
  const sales = (await db.prepare(`
    SELECT
      COUNT(id) as total_invoices,
      COALESCE(SUM(grand_total), 0) as total_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN paid_amount ELSE 0 END), 0) as pure_cash_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'visa' OR payment_method = 'mastercard' THEN paid_amount ELSE 0 END), 0) as card_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'credit' THEN grand_total ELSE 0 END), 0) as credit_sales,
      COALESCE(SUM(CASE WHEN payment_method = 'wallet' OR payment_method = 'instapay' THEN paid_amount ELSE 0 END), 0) as digital_sales,
      COALESCE(SUM(discount_amount), 0) as total_discounts
    FROM sales
    WHERE shift_id = ? AND status = 'completed'
  `).get(shiftId)) || {};

  // Also parse mixed payment cash parts
  const mixedSales = await db.prepare(`
    SELECT payment_details FROM sales WHERE shift_id = ? AND payment_method = 'mixed' AND status = 'completed'
  `).all(shiftId);

  let mixedCashTotal = 0;
  mixedSales.forEach(s => {
    try {
      const p = JSON.parse(s.payment_details);
      if (p.cash) mixedCashTotal += parseFloat(p.cash) || 0;
    } catch (e) {}
  });

  const pureCash = parseFloat(sales.pure_cash_sales || 0);
  const totalCashSales = pureCash + mixedCashTotal;

  // 2. Returns in this shift
  const returns = (await db.prepare(`
    SELECT
      COUNT(id) as total_returns,
      COALESCE(SUM(total_refund), 0) as total_refund,
      COALESCE(SUM(CASE WHEN refund_method = 'cash' THEN total_refund ELSE 0 END), 0) as cash_refund
    FROM returns
    WHERE shift_id = ?
  `).get(shiftId)) || {};

  // 3. Expenses linked to this shift
  const expenses = (await db.prepare(`
    SELECT
      COUNT(id) as total_expenses_count,
      COALESCE(SUM(amount), 0) as total_expenses_amount
    FROM expenses
    WHERE shift_id = ?
  `).get(shiftId)) || {};

  // 4. Manual Cash In & Out
  const cashTransactions = (await db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_cash_in,
      COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_cash_out
    FROM cash_transactions
    WHERE shift_id = ?
  `).get(shiftId)) || {};

  // Expected Cash calculation
  const openingCash = parseFloat(shift.opening_cash || 0);
  const cashRefund = parseFloat(returns.cash_refund || 0);
  const expAmount = parseFloat(expenses.total_expenses_amount || 0);
  const cashIn = parseFloat(cashTransactions.total_cash_in || 0);
  const cashOut = parseFloat(cashTransactions.total_cash_out || 0);

  const expectedCash = (
    openingCash +
    totalCashSales -
    cashRefund -
    expAmount +
    cashIn -
    cashOut
  );

  return {
    shift,
    sales: {
      ...sales,
      total_cash_sales: totalCashSales
    },
    returns,
    expenses,
    cashTransactions,
    expectedCash: Math.round(expectedCash * 100) / 100
  };
}

// GET /api/shifts/active - Get current active shift
router.get('/active', authenticateToken, async (req, res) => {
  try {
    // First look for user's open shift
    let active = await db.prepare(`
      SELECT id FROM shifts WHERE cashier_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1
    `).get(req.user.id);

    if (!active) {
      // If none, check if any open shift exists
      active = await db.prepare(`SELECT id FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1`).get();
    }

    if (!active) {
      return res.json({ hasActiveShift: false });
    }

    const metrics = await getShiftMetrics(active.id);
    res.json({
      hasActiveShift: true,
      metrics
    });
  } catch (err) {
    console.error('Error fetching active shift:', err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الشيفت النشط' });
  }
});

// POST /api/shifts/open - Open new shift
router.post('/open', authenticateToken, async (req, res) => {
  try {
    const { openingCash, notes = '' } = req.body;

    // Check if cashier already has an open shift
    const existing = await db.prepare(`
      SELECT id FROM shifts WHERE cashier_id = ? AND status = 'open'
    `).get(req.user.id);

    if (existing) {
      return res.status(400).json({ error: 'لديك شيفت مفتوح بالفعل، يرجى إغلاقه أولاً' });
    }

    // Get Admin configured opening balance
    const defRow = await db.prepare("SELECT value FROM settings WHERE key = 'default_opening_cash'").get();
    const defaultCash = defRow ? parseFloat(defRow.value) || 1000 : 1000;

    // Cashier is strictly forced to use the admin-defined float amount
    let opCash = defaultCash;
    if (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager') {
      if (openingCash !== undefined && !isNaN(parseFloat(openingCash))) {
        opCash = parseFloat(openingCash);
      }
    }

    const result = await db.prepare(`
      INSERT INTO shifts (cashier_id, opening_cash, status, notes)
      VALUES (?, ?, 'open', ?)
    `).run(req.user.id, opCash, notes);

    const shiftId = result.lastInsertRowid;

    logAudit(
      req.user.id,
      req.user.username,
      'SHIFT_OPEN',
      `فتح شيفت كاشير جديد رقم #${shiftId} بعهدة نقدية: ${opCash.toFixed(2)} ج.م (المستخدم: ${req.user.full_name})`,
      req.ip
    );

    res.json({ success: true, message: 'تم فتح الشيفت بنجاح واستلام العهدة', shiftId, openingCash: opCash });
  } catch (err) {
    console.error('Error opening shift:', err);
    res.status(500).json({ error: 'خطأ في فتح الشيفت' });
  }
});

// POST /api/shifts/cash-transaction - Cash In / Out
router.post('/cash-transaction', authenticateToken, async (req, res) => {
  try {
    const { shiftId, type, amount, reason } = req.body;
    const amt = parseFloat(amount);

    if (!type || isNaN(amt) || amt <= 0 || !reason) {
      return res.status(400).json({ error: 'يرجى إدخال نوع الحركة والمبلغ والسبب' });
    }

    let sId = shiftId;
    if (!sId) {
      const active = await db.prepare(`
        SELECT id FROM shifts WHERE (cashier_id = ? OR status = 'open') AND status = 'open' ORDER BY id DESC LIMIT 1
      `).get(req.user.id);
      if (active) sId = active.id;
    }

    if (!sId) {
      return res.status(400).json({ error: 'لا يوجد شيفت نشط لتسجيل الحركة عليه' });
    }

    await db.prepare(`
      INSERT INTO cash_transactions (shift_id, type, amount, reason)
      VALUES (?, ?, ?, ?)
    `).run(sId, type, amt, reason);

    logAudit(
      req.user.id,
      req.user.username,
      type === 'in' ? 'CASH_IN' : 'CASH_OUT',
      `حركة نقدية (${type === 'in' ? 'إيداع درج' : 'سحب من الدرج'}): ${amt.toFixed(2)} ج.م - السبب: ${reason}`,
      req.ip
    );

    res.json({ success: true, message: 'تم تسجيل الحركة النقدية في الدرج بنجاح' });
  } catch (err) {
    console.error('Error in cash transaction:', err);
    res.status(500).json({ error: 'خطأ في تسجيل الحركة النقدية' });
  }
});

// POST /api/shifts/close - Close shift
router.post('/close', authenticateToken, async (req, res) => {
  try {
    const { shiftId, actualCash, notes = '' } = req.body;
    const actual = parseFloat(actualCash);

    if (isNaN(actual) || actual < 0) {
      return res.status(400).json({ error: 'يرجى إدخال النقدية الفعلية المحسوبة في الدرج' });
    }

    let targetShiftId = shiftId;
    if (!targetShiftId) {
      const active = await db.prepare(`
        SELECT id FROM shifts WHERE cashier_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1
      `).get(req.user.id);
      if (active) targetShiftId = active.id;
    }

    if (!targetShiftId) {
      return res.status(404).json({ error: 'لا يوجد شيفت نشط لإغلاقه' });
    }

    const metrics = await getShiftMetrics(targetShiftId);
    if (!metrics) {
      return res.status(404).json({ error: 'الشيفت غير موجود' });
    }

    const expected = metrics.expectedCash;
    const difference = actual - expected;

    await db.transaction(async (tx) => {
      await tx.prepare(`
        UPDATE shifts SET
          end_time = CURRENT_TIMESTAMP,
          closing_cash_expected = ?,
          closing_cash_actual = ?,
          difference = ?,
          status = 'closed',
          notes = ?
        WHERE id = ?
      `).run(expected, actual, difference, notes, targetShiftId);

      logAudit(
        req.user.id,
        req.user.username,
        'SHIFT_CLOSE',
        `إغلاق الشيفت #${targetShiftId} - المتوقع: ${expected.toFixed(2)} ج.م، الفعلي: ${actual.toFixed(2)} ج.م، الفارق: ${difference.toFixed(2)} ج.م`,
        req.ip
      );
    });

    const finalMetrics = await getShiftMetrics(targetShiftId);
    res.json({
      success: true,
      message: 'تم إغلاق الشيفت بنجاح وإصدار تقرير التقفيل النهائي (Z-Report)',
      metrics: finalMetrics
    });
  } catch (err) {
    console.error('Error closing shift:', err);
    res.status(500).json({ error: 'خطأ في إغلاق الشيفت' });
  }
});

// GET /api/shifts - List past shifts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;

    const shifts = await db.prepare(`
      SELECT s.*, u.full_name as cashier_name
      FROM shifts s
      JOIN users u ON s.cashier_id = u.id
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));

    res.json(shifts);
  } catch (err) {
    console.error('Error listing shifts:', err);
    res.status(500).json({ error: 'خطأ في جلب سجل الشيفتات' });
  }
});

// GET /api/shifts/treasury - Get real-time multi-vault balances and transactions
router.get('/treasury', authenticateToken, async (req, res) => {
  try {
    // 1. Settings opening balances
    const getSettingNum = async (key, def) => {
      const r = await db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return r ? parseFloat(r.value) || def : def;
    };

    const mainSafeOpening = await getSettingNum('main_safe_opening_balance', 0);
    const visaOpening = await getSettingNum('visa_opening_balance', 0);
    const instapayOpening = await getSettingNum('instapay_opening_balance', 0);
    const defaultOpeningCash = await getSettingNum('default_opening_cash', 0);

    // 2. Main Safe balance
    const safeStats = (await db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type IN ('in', 'transfer') THEN amount ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_out
      FROM treasury_transactions
      WHERE account = 'main_safe'
    `).get()) || {};

    const mainSafeBalance = mainSafeOpening + parseFloat(safeStats.total_in || 0) - parseFloat(safeStats.total_out || 0);

    // 3. Visa / Card balance
    const cardSalesRaw = (await db.prepare(`
      SELECT COALESCE(SUM(paid_amount), 0) as total
      FROM sales
      WHERE payment_method IN ('visa', 'mastercard') AND status = 'completed'
    `).get())?.total || 0;

    const mixedSales = await db.prepare(`
      SELECT payment_details FROM sales WHERE payment_method = 'mixed' AND status = 'completed'
    `).all();
    let mixedCardTotal = 0;
    let mixedInstapayTotal = 0;
    mixedSales.forEach(s => {
      try {
        const p = JSON.parse(s.payment_details);
        if (p.visa) mixedCardTotal += parseFloat(p.visa) || 0;
        if (p.wallet || p.instapay) mixedInstapayTotal += parseFloat(p.wallet || p.instapay) || 0;
      } catch (e) {}
    });

    const visaTx = (await db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_out
      FROM treasury_transactions
      WHERE account = 'visa'
    `).get()) || {};

    const visaBalance = visaOpening + parseFloat(cardSalesRaw) + mixedCardTotal + parseFloat(visaTx.total_in || 0) - parseFloat(visaTx.total_out || 0);

    // 4. InstaPay / Digital Wallets balance
    const instapaySalesRaw = (await db.prepare(`
      SELECT COALESCE(SUM(paid_amount), 0) as total
      FROM sales
      WHERE payment_method IN ('wallet', 'instapay') AND status = 'completed'
    `).get())?.total || 0;

    const instapayTx = (await db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_out
      FROM treasury_transactions
      WHERE account = 'instapay'
    `).get()) || {};

    const instapayBalance = instapayOpening + parseFloat(instapaySalesRaw) + mixedInstapayTotal + parseFloat(instapayTx.total_in || 0) - parseFloat(instapayTx.total_out || 0);

    // 5. Drawer Cash (Live from currently open shifts)
    const openShifts = await db.prepare(`SELECT id FROM shifts WHERE status = 'open'`).all();
    let currentDrawerCash = 0;
    for (const s of openShifts) {
      const m = await getShiftMetrics(s.id);
      if (m) currentDrawerCash += m.expectedCash;
    }

    // Total Liquidity
    const totalLiquidity = mainSafeBalance + visaBalance + instapayBalance + currentDrawerCash;

    // Recent Treasury & Transfer Transactions
    const recentTransactions = await db.prepare(`
      SELECT t.*, u.full_name as user_name
      FROM treasury_transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC LIMIT 40
    `).all();

    res.json({
      balances: {
        mainSafe: Math.round(mainSafeBalance * 100) / 100,
        visa: Math.round(visaBalance * 100) / 100,
        instapay: Math.round(instapayBalance * 100) / 100,
        drawer: Math.round(currentDrawerCash * 100) / 100,
        totalLiquidity: Math.round(totalLiquidity * 100) / 100
      },
      defaultOpeningCash,
      openShiftsCount: openShifts.length,
      recentTransactions
    });
  } catch (err) {
    console.error('Error fetching treasury:', err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الخزينة' });
  }
});

// POST /api/shifts/transfer-to-safe - Transfer cash from drawer to main safe
router.post('/transfer-to-safe', authenticateToken, async (req, res) => {
  try {
    const { amount, notes = '' } = req.body;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال مبلغ صحيح للتحويل' });
    }

    // Find user's active shift or any open shift
    let active = await db.prepare(`
      SELECT * FROM shifts WHERE (cashier_id = ? OR status = 'open') AND status = 'open' ORDER BY id DESC LIMIT 1
    `).get(req.user.id);

    if (!active) {
      return res.status(400).json({ error: 'لا يوجد شيفت نشط حالياً للتحويل منه' });
    }

    const metrics = await getShiftMetrics(active.id);
    if (amt > metrics.expectedCash) {
      return res.status(400).json({
        error: `المبلغ المطلوب تحويله (${amt.toFixed(2)} ج.م) أكبر من النقدية المتوفرة حالياً في الدرج (${metrics.expectedCash.toFixed(2)} ج.م)`
      });
    }

    await db.transaction(async (tx) => {
      // 1. Record cash out from shift drawer
      await tx.prepare(`
        INSERT INTO cash_transactions (shift_id, type, amount, reason)
        VALUES (?, 'out', ?, ?)
      `).run(active.id, amt, 'تحويل وتوريد نقدية من الدرج إلى الخزنة الرئيسية');

      // 2. Record treasury transfer into main_safe
      await tx.prepare(`
        INSERT INTO treasury_transactions (account, type, amount, related_account, shift_id, user_id, reason, notes)
        VALUES ('main_safe', 'transfer', ?, 'drawer', ?, ?, 'تحويل وتوريد نقدية من الدرج إلى الخزنة الرئيسية', ?)
      `).run(amt, active.id, req.user.id, notes);

      logAudit(
        req.user.id,
        req.user.username,
        'DRAWER_TRANSFER_TO_SAFE',
        `تحويل نقدية من درج شيفت #${active.id} إلى الخزنة الرئيسية بمبلغ: ${amt.toFixed(2)} ج.م`,
        req.ip
      );
    });

    res.json({
      success: true,
      message: `تم تحويل مبلغ ${amt.toFixed(2)} ج.م من درج الكاشير إلى الخزنة الرئيسية بنجاح`
    });
  } catch (err) {
    console.error('Error transferring to safe:', err);
    res.status(500).json({ error: 'خطأ في عملية التحويل' });
  }
});

// POST /api/shifts/admin-withdraw - Admin withdraws money from safe, drawer, visa, or instapay
router.post('/admin-withdraw', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'صلاحية سحب الأموال مخصصة للمدير العام والإدارة فقط' });
  }

  const { account, amount, reason, notes = '' } = req.body;
  const amt = parseFloat(amount);
  if (!account || isNaN(amt) || amt <= 0 || !reason) {
    return res.status(400).json({ error: 'يرجى إدخال الحساب والمبلغ وسبب السحب' });
  }

  const validAccounts = ['main_safe', 'drawer', 'visa', 'instapay'];
  if (!validAccounts.includes(account)) {
    return res.status(400).json({ error: 'الحساب المالي المحدد غير صالح' });
  }

  try {
    await db.transaction(async (tx) => {
      let shiftId = null;
      if (account === 'drawer') {
        const active = await tx.prepare(`SELECT id FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1`).get();
        if (!active) {
          throw new Error('لا يوجد شيفت مفتوح حالياً لسحب نقدية من الدرج');
        }
        shiftId = active.id;
        // Record cash out from shift drawer
        await tx.prepare(`
          INSERT INTO cash_transactions (shift_id, type, amount, reason)
          VALUES (?, 'out', ?, ?)
        `).run(shiftId, amt, `سحب إدارة من الدرج: ${reason}`);
      }

      await tx.prepare(`
        INSERT INTO treasury_transactions (account, type, amount, shift_id, user_id, reason, notes)
        VALUES (?, 'out', ?, ?, ?, ?, ?)
      `).run(account, amt, shiftId, req.user.id, reason, notes);

      const accountNameAr = {
        main_safe: 'الخزنة الرئيسية',
        drawer: 'درج الكاشير',
        visa: 'حساب الفيزا',
        instapay: 'حساب إنستا باي'
      }[account];

      logAudit(
        req.user.id,
        req.user.username,
        'TREASURY_WITHDRAW',
        `سحب أموال إدارة من [${accountNameAr}]: ${amt.toFixed(2)} ج.م - السبب: ${reason}`,
        req.ip
      );
    });

    res.json({ success: true, message: `تم سحب ${amt.toFixed(2)} ج.م بنجاح` });
  } catch (err) {
    console.error('Error in admin withdraw:', err);
    res.status(400).json({ error: err.message || 'فشل تنفيذ عملية السحب' });
  }
});

// POST /api/shifts/admin-deposit - Admin deposits money into safe, visa, or instapay
router.post('/admin-deposit', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') {
    return res.status(403).json({ error: 'صلاحية الإيداع مخصصة للإدارة فقط' });
  }

  const { account, amount, reason, notes = '' } = req.body;
  const amt = parseFloat(amount);
  if (!account || isNaN(amt) || amt <= 0 || !reason) {
    return res.status(400).json({ error: 'يرجى إدخال الحساب والمبلغ والسبب' });
  }

  try {
    await db.transaction(async (tx) => {
      let shiftId = null;
      if (account === 'drawer') {
        const active = await tx.prepare(`SELECT id FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1`).get();
        if (active) {
          shiftId = active.id;
          await tx.prepare(`
            INSERT INTO cash_transactions (shift_id, type, amount, reason)
            VALUES (?, 'in', ?, ?)
          `).run(shiftId, amt, `إيداع إدارة في الدرج: ${reason}`);
        }
      }

      await tx.prepare(`
        INSERT INTO treasury_transactions (account, type, amount, shift_id, user_id, reason, notes)
        VALUES (?, 'in', ?, ?, ?, ?, ?)
      `).run(account, amt, shiftId, req.user.id, reason, notes);

      const accountNameAr = {
        main_safe: 'الخزنة الرئيسية',
        drawer: 'درج الكاشير',
        visa: 'حساب الفيزا',
        instapay: 'حساب إنستا باي'
      }[account];

      logAudit(
        req.user.id,
        req.user.username,
        'TREASURY_DEPOSIT',
        `إيداع أموال في [${accountNameAr}]: ${amt.toFixed(2)} ج.م - السبب: ${reason}`,
        req.ip
      );
    });

    res.json({ success: true, message: `تم إيداع ${amt.toFixed(2)} ج.م بنجاح` });
  } catch (err) {
    console.error('Error in admin deposit:', err);
    res.status(400).json({ error: err.message || 'فشل تنفيذ عملية الإيداع' });
  }
});

module.exports = router;
