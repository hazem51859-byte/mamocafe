const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/suppliers - List all suppliers with stats
router.get('/', authenticateToken, (req, res) => {
  const suppliers = db.prepare(`
    SELECT s.*,
           COUNT(p.id) as total_purchases_count,
           COALESCE(SUM(p.grand_total), 0) as total_purchases_amount
    FROM suppliers s
    LEFT JOIN purchases p ON s.id = p.supplier_id
    GROUP BY s.id
    ORDER BY s.name ASC
  `).all();

  res.json(suppliers);
});

// POST /api/suppliers - Add supplier
router.post('/', authenticateToken, requirePermission('manage_suppliers'), (req, res) => {
  const { name, company, phone, address, taxNumber, openingBalance = 0, notes = '' } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'اسم المورد مطلوب' });
  }

  const opBal = parseFloat(openingBalance) || 0;

  const result = db.prepare(`
    INSERT INTO suppliers (name, company, phone, address, tax_number, opening_balance, current_balance, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name.trim(), company || '', phone || '', address || '', taxNumber || '', opBal, opBal, notes);

  logAudit(req.user.id, req.user.username, 'SUPPLIER_ADDED', `إضافة مورد: ${name}`, req.ip);

  res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة المورد بنجاح' });
});

// PUT /api/suppliers/:id - Edit supplier
router.put('/:id', authenticateToken, requirePermission('manage_suppliers'), (req, res) => {
  const id = req.params.id;
  const { name, company, phone, address, taxNumber, notes } = req.body;

  const current = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'المورد غير موجود' });
  }

  db.prepare(`
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
});

// GET /api/suppliers/:id/statement - Supplier Account Statement (كشف حساب مورد)
router.get('/:id/statement', authenticateToken, (req, res) => {
  const id = req.params.id;
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);

  if (!supplier) {
    return res.status(404).json({ error: 'المورد غير موجود' });
  }

  const purchases = db.prepare(`
    SELECT id, invoice_number, invoice_date, grand_total, paid_amount, remaining_amount, 'فاتورة مشتريات' as transaction_type
    FROM purchases
    WHERE supplier_id = ?
    ORDER BY invoice_date ASC, id ASC
  `).all(id);

  const payments = db.prepare(`
    SELECT id, amount, payment_date, payment_method, notes, 'سند صرف نقدية' as transaction_type
    FROM supplier_payments
    WHERE supplier_id = ?
    ORDER BY payment_date ASC, id ASC
  `).all(id);

  res.json({ supplier, purchases, payments });
});

// POST /api/suppliers/:id/pay - Record supplier payment (سند صرف)
router.post('/:id/pay', authenticateToken, requirePermission('manage_suppliers'), (req, res) => {
  const id = req.params.id;
  const { amount, paymentDate = new Date().toISOString().slice(0, 10), paymentMethod = 'cash', notes = '' } = req.body;
  const amt = parseFloat(amount);

  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'يرجى إدخال مبلغ صحيح' });
  }

  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  if (!supplier) {
    return res.status(404).json({ error: 'المورد غير موجود' });
  }

  const payTx = db.transaction(() => {
    db.prepare(`
      INSERT INTO supplier_payments (supplier_id, amount, payment_date, payment_method, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, amt, paymentDate, paymentMethod, notes);

    db.prepare('UPDATE suppliers SET current_balance = current_balance - ? WHERE id = ?').run(amt, id);

    logAudit(
      req.user.id,
      req.user.username,
      'SUPPLIER_PAID',
      `سداد دفعة للمورد ${supplier.name} بقيمة ${amt.toFixed(2)} ج.م (${paymentMethod})`,
      req.ip
    );
  });

  payTx();
  res.json({ success: true, message: `تم تسجيل سند صرف بقيمة ${amt.toFixed(2)} ج.م للمورد ${supplier.name}` });
});

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', authenticateToken, requirePermission('manage_suppliers'), (req, res) => {
  const id = req.params.id;
  const purchasesCount = db.prepare('SELECT COUNT(*) as count FROM purchases WHERE supplier_id = ?').get(id).count;
  if (purchasesCount > 0) {
    return res.status(400).json({ error: `لا يمكن حذف هذا المورد لوجود ${purchasesCount} فاتورة مشتريات مسجلة له` });
  }

  db.prepare('DELETE FROM supplier_payments WHERE supplier_id = ?').run(id);
  db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);

  logAudit(req.user.id, req.user.username, 'SUPPLIER_DELETED', `حذف مورد رقم ${id}`, req.ip);
  res.json({ success: true, message: 'تم حذف المورد بنجاح' });
});

module.exports = router;
