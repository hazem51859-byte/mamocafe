const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// Helper to calculate real-time shift stats
function getShiftMetrics(shiftId) {
  const shift = db.prepare(`
    SELECT s.*, u.full_name as cashier_name, u.username as cashier_username
    FROM shifts s
    JOIN users u ON s.cashier_id = u.id
    WHERE s.id = ?
  `).get(shiftId);

  if (!shift) return null;

  // 1. Sales inside this shift
  const sales = db.prepare(`
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
  `).get(shiftId);

  // Also parse mixed payment cash parts
  const mixedSales = db.prepare(`
    SELECT payment_details FROM sales WHERE shift_id = ? AND payment_method = 'mixed' AND status = 'completed'
  `).all(shiftId);

  let mixedCashTotal = 0;
  mixedSales.forEach(s => {
    try {
      const p = JSON.parse(s.payment_details);
      if (p.cash) mixedCashTotal += parseFloat(p.cash) || 0;
    } catch (e) {}
  });

  const totalCashSales = sales.pure_cash_sales + mixedCashTotal;

  // 2. Returns in this shift
  const returns = db.prepare(`
    SELECT
      COUNT(id) as total_returns,
      COALESCE(SUM(total_refund), 0) as total_refund,
      COALESCE(SUM(CASE WHEN refund_method = 'cash' THEN total_refund ELSE 0 END), 0) as cash_refund
    FROM returns
    WHERE shift_id = ?
  `).get(shiftId);

  // 3. Expenses linked to this shift
  const expenses = db.prepare(`
    SELECT
      COUNT(id) as total_expenses_count,
      COALESCE(SUM(amount), 0) as total_expenses_amount
    FROM expenses
    WHERE shift_id = ?
  `).get(shiftId);

  // 4. Manual Cash In & Out
  const cashTransactions = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_cash_in,
      COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_cash_out
    FROM cash_transactions
    WHERE shift_id = ?
  `).get(shiftId);

  // Expected Cash calculation
  const expectedCash = (
    parseFloat(shift.opening_cash) +
    totalCashSales -
    returns.cash_refund -
    expenses.total_expenses_amount +
    cashTransactions.total_cash_in -
    cashTransactions.total_cash_out
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
router.get('/active', authenticateToken, (req, res) => {
  // First look for user's open shift
  let active = db.prepare(`
    SELECT id FROM shifts WHERE cashier_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1
  `).get(req.user.id);

  if (!active) {
    // If none, check if any open shift exists
    active = db.prepare(`SELECT id FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1`).get();
  }

  if (!active) {
    return res.json({ hasActiveShift: false });
  }

  const metrics = getShiftMetrics(active.id);
  res.json({
    hasActiveShift: true,
    metrics
  });
});

// POST /api/shifts/open - Open new shift
router.post('/open', authenticateToken, (req, res) => {
  const { openingCash = 0, notes = '' } = req.body;

  // Check if cashier already has an open shift
  const existing = db.prepare(`
    SELECT id FROM shifts WHERE cashier_id = ? AND status = 'open'
  `).get(req.user.id);

  if (existing) {
    return res.status(400).json({ error: 'لديك شيفت مفتوح بالفعل، يرجى إغلاقه أولاً' });
  }

  const opCash = parseFloat(openingCash) || 0;

  const result = db.prepare(`
    INSERT INTO shifts (cashier_id, opening_cash, status, notes)
    VALUES (?, ?, 'open', ?)
  `).run(req.user.id, opCash, notes);

  const shiftId = result.lastInsertRowid;

  logAudit(
    req.user.id,
    req.user.username,
    'SHIFT_OPEN',
    `فتح شيفت كاشير جديد رقم #${shiftId} بعهدة نقدية: ${opCash.toFixed(2)} ج.م`,
    req.ip
  );

  res.json({ success: true, message: 'تم فتح الشيفت بنجاح', shiftId });
});

// POST /api/shifts/cash-transaction - Cash In / Out
router.post('/cash-transaction', authenticateToken, (req, res) => {
  const { shiftId, type, amount, reason } = req.body;
  const amt = parseFloat(amount);

  if (!type || isNaN(amt) || amt <= 0 || !reason) {
    return res.status(400).json({ error: 'يرجى إدخال نوع الحركة والمبلغ والسبب' });
  }

  let sId = shiftId;
  if (!sId) {
    const active = db.prepare(`
      SELECT id FROM shifts WHERE (cashier_id = ? OR status = 'open') AND status = 'open' ORDER BY id DESC LIMIT 1
    `).get(req.user.id);
    if (active) sId = active.id;
  }

  if (!sId) {
    return res.status(400).json({ error: 'لا يوجد شيفت نشط لتسجيل الحركة عليه' });
  }

  db.prepare(`
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
});

// POST /api/shifts/close - Close shift
router.post('/close', authenticateToken, (req, res) => {
  const { shiftId, actualCash, notes = '' } = req.body;
  const actual = parseFloat(actualCash);

  if (isNaN(actual) || actual < 0) {
    return res.status(400).json({ error: 'يرجى إدخال النقدية الفعلية المحسوبة في الدرج' });
  }

  let targetShiftId = shiftId;
  if (!targetShiftId) {
    const active = db.prepare(`
      SELECT id FROM shifts WHERE cashier_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1
    `).get(req.user.id);
    if (active) targetShiftId = active.id;
  }

  if (!targetShiftId) {
    return res.status(404).json({ error: 'لا يوجد شيفت نشط لإغلاقه' });
  }

  const metrics = getShiftMetrics(targetShiftId);
  if (!metrics) {
    return res.status(404).json({ error: 'الشيفت غير موجود' });
  }

  const expected = metrics.expectedCash;
  const difference = actual - expected;

  const closeTx = db.transaction(() => {
    db.prepare(`
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

  closeTx();

  const finalMetrics = getShiftMetrics(targetShiftId);
  res.json({
    success: true,
    message: 'تم إغلاق الشيفت بنجاح وإصدار تقرير التقفيل النهائي (Z-Report)',
    metrics: finalMetrics
  });
});

// GET /api/shifts - List past shifts
router.get('/', authenticateToken, (req, res) => {
  const { limit = 30, offset = 0 } = req.query;

  const shifts = db.prepare(`
    SELECT s.*, u.full_name as cashier_name
    FROM shifts s
    JOIN users u ON s.cashier_id = u.id
    ORDER BY s.id DESC
    LIMIT ? OFFSET ?
  `).all(parseInt(limit), parseInt(offset));

  res.json(shifts);
});

// GET /api/shifts/:id/report - Full Shift Z-Report
router.get('/:id/report', authenticateToken, (req, res) => {
  const metrics = getShiftMetrics(req.params.id);
  if (!metrics) {
    return res.status(404).json({ error: 'الشيفت غير موجود' });
  }
  res.json(metrics);
});

module.exports = router;
