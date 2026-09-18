const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/suppliers - List all suppliers with stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const suppliers = await db.prepare(`
      SELECT s.*,
             COUNT(p.id) as total_purchases_count,
             COALESCE(SUM(p.grand_total), 0) as total_purchases_amount
      FROM suppliers s
      LEFT JOIN purchases p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `).all();

    res.json(suppliers);
  } catch (err) {
    console.error('Error listing suppliers:', err);
    res.status(500).json({ error: 'خطأ في جلب بيانات الموردين' });
  }
});

// POST /api/suppliers - Add supplier
router.post('/', authenticateToken, requirePermission('manage_suppliers'), async (req, res) => {
  try {
    const { name, company, phone, address, taxNumber, openingBalance = 0, notes = '' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'اسم المورد مطلوب' });
    }

    const opBal = parseFloat(openingBalance) || 0;

    const result = await db.prepare(`
      INSERT INTO suppliers (name, company, phone, address, tax_number, opening_balance, current_balance, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name.trim(), company || '', phone || '', address || '', taxNumber || '', opBal, opBal, notes);

    logAudit(req.user.id, req.user.username, 'SUPPLIER_ADDED', `إضافة مورد: ${name}`, req.ip);

    res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة المورد بنجاح' });
  } catch (err) {
    console.error('Error adding supplier:', err);
    res.status(500).json({ error: 'خطأ في إضافة المورد' });
  }
});

// PUT /api/suppliers/:id - Edit supplier
router.put('/:id', authenticateToken, requirePermission('manage_suppliers'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, company, phone, address, taxNumber, notes } = req.body;

    const current = await db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ error: 'المورد غير موجود' });
    }

    await db.prepare(`
      UPDATE suppliers SET
        name = ?, company = ?, phone = ?, address = ?, tax_number = ?, notes = ?
      WHERE id = ?
    `).run(
      name ? name.trim() : current.name,
      company !== undefined ? company : current.company,
      phone !== undefined ? phone : current.phone,
      address !== undefined ? address : current.address,
      taxNumber !== undefined ? taxNumber : current.tax_number,
      notes !== undefined ? notes : current.notes,
      id
    );

    logAudit(req.user.id, req.user.username, 'SUPPLIER_EDITED', `تعديل بيانات مورد: ${name || current.name}`, req.ip);

    res.json({ success: true, message: 'تم تحديث بيانات المورد بنجاح' });
  } catch (err) {
    console.error('Error editing supplier:', err);
    res.status(500).json({ error: 'خطأ في تعديل بيانات المورد' });
  }
});

// GET /api/suppliers/:id/statement - Supplier Account Statement (كشف حساب مورد)
router.get('/:id/statement', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const supplier = await db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

    if (!supplier) {
      return res.status(404).json({ error: 'المورد غير موجود' });
    }

    const purchases = await db.prepare(`
      SELECT id, invoice_number, invoice_date, grand_total, paid_amount, remaining_amount, 'فاتورة مشتريات' as transaction_type
      FROM purchases
      WHERE supplier_id = ?
      ORDER BY invoice_date ASC, id ASC
    `).all(id);

    const payments = await db.prepare(`
      SELECT id, amount, payment_date, payment_method, notes, 'سند صرف نقدية' as transaction_type
      FROM supplier_payments
      WHERE supplier_id = ?
      ORDER BY payment_date ASC, id ASC
    `).all(id);

    res.json({ supplier, purchases, payments });
  } catch (err) {
    console.error('Error fetching statement:', err);
    res.status(500).json({ error: 'خطأ في جلب كشف حساب المورد' });
  }
});

// POST /api/suppliers/:id/pay - Record supplier payment (سند صرف)
router.post('/:id/pay', authenticateToken, requirePermission('manage_suppliers'), async (req, res) => {
  try {
    const id = req.params.id;
    const { amount, paymentDate = new Date().toISOString().slice(0, 10), paymentMethod = 'cash', notes = '' } = req.body;
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال مبلغ صحيح' });
    }

    const supplier = await db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!supplier) {
      return res.status(404).json({ error: 'المورد غير موجود' });
    }

    await db.transaction(async (tx) => {
      await tx.prepare(`
        INSERT INTO supplier_payments (supplier_id, amount, payment_date, payment_method, notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, amt, paymentDate, paymentMethod, notes);

      await tx.prepare('UPDATE suppliers SET current_balance = current_balance - ? WHERE id = ?').run(amt, id);

      logAudit(
        req.user.id,
        req.user.username,
        'SUPPLIER_PAID',
        `سداد دفعة للمورد ${supplier.name} بقيمة ${amt.toFixed(2)} ج.م (${paymentMethod})`,
        req.ip
      );
    });

    res.json({ success: true, message: `تم تسجيل سند صرف بقيمة ${amt.toFixed(2)} ج.م للمورد ${supplier.name}` });
  } catch (err) {
    console.error('Error paying supplier:', err);
    res.status(500).json({ error: 'خطأ في تسجيل سند الصرف' });
  }
});

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', authenticateToken, requirePermission('manage_suppliers'), async (req, res) => {
  try {
    const id = req.params.id;
    const purchasesCountRes = await db.prepare('SELECT COUNT(*) as count FROM purchases WHERE supplier_id = ?').get(id);
    const purchasesCount = purchasesCountRes ? parseInt(purchasesCountRes.count) : 0;
    if (purchasesCount > 0) {
      return res.status(400).json({ error: `لا يمكن حذف هذا المورد لوجود ${purchasesCount} فاتورة مشتريات مسجلة له` });
    }

    await db.prepare('DELETE FROM supplier_payments WHERE supplier_id = ?').run(id);
    await db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);

    logAudit(req.user.id, req.user.username, 'SUPPLIER_DELETED', `حذف مورد رقم ${id}`, req.ip);
    res.json({ success: true, message: 'تم حذف المورد بنجاح' });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ error: 'خطأ في حذف المورد' });
  }
});

module.exports = router;
