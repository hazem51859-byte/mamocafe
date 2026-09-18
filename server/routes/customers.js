const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/customers - List customers with balances
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customers = await db.prepare(`
      SELECT c.*,
             COUNT(s.id) as total_invoices_count,
             COALESCE(SUM(s.grand_total), 0) as total_purchased,
             MAX(s.created_at) as last_purchase_date
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all();

    res.json(customers);
  } catch (err) {
    console.error('Error listing customers:', err);
    res.status(500).json({ error: 'خطأ في جلب بيانات العملاء' });
  }
});

// POST /api/customers - Add customer
router.post('/', authenticateToken, requirePermission('manage_customers'), async (req, res) => {
  try {
    const { name, phone, address, creditLimit = 5000, notes = '' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'اسم العميل مطلوب' });
    }

    const result = await db.prepare(`
      INSERT INTO customers (name, phone, address, balance, credit_limit, notes)
      VALUES (?, ?, ?, 0, ?, ?)
    `).run(name.trim(), phone || '', address || '', parseFloat(creditLimit) || 5000, notes);

    logAudit(req.user.id, req.user.username, 'CUSTOMER_ADDED', `إضافة عميل جديد: ${name}`, req.ip);

    res.json({ success: true, id: result.lastInsertRowid, message: 'تمت إضافة العميل بنجاح' });
  } catch (err) {
    console.error('Error adding customer:', err);
    res.status(500).json({ error: 'خطأ في إضافة العميل' });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', authenticateToken, requirePermission('manage_customers'), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone, address, creditLimit, notes } = req.body;

    const current = await db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    await db.prepare(`
      UPDATE customers SET
        name = ?, phone = ?, address = ?, credit_limit = ?, notes = ?
      WHERE id = ?
    `).run(
      name ? name.trim() : current.name,
      phone !== undefined ? phone : current.phone,
      address !== undefined ? address : current.address,
      creditLimit !== undefined ? parseFloat(creditLimit) : current.credit_limit,
      notes !== undefined ? notes : current.notes,
      id
    );

    logAudit(req.user.id, req.user.username, 'CUSTOMER_EDITED', `تعديل بيانات عميل: ${name || current.name}`, req.ip);

    res.json({ success: true, message: 'تم تحديث بيانات العميل بنجاح' });
  } catch (err) {
    console.error('Error editing customer:', err);
    res.status(500).json({ error: 'خطأ في تعديل بيانات العميل' });
  }
});

// GET /api/customers/:id/statement - Customer statement
router.get('/:id/statement', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    const invoices = await db.prepare(`
      SELECT id, invoice_number, grand_total, paid_amount, remaining_amount, payment_method, created_at, 'فاتورة مبيعات' as transaction_type
      FROM sales
      WHERE customer_id = ?
      ORDER BY created_at ASC
    `).all(id);

    const payments = await db.prepare(`
      SELECT id, amount, payment_date, payment_method, notes, 'سداد مديونية (سند قبض)' as transaction_type
      FROM customer_payments
      WHERE customer_id = ?
      ORDER BY payment_date ASC
    `).all(id);

    res.json({ customer, invoices, payments });
  } catch (err) {
    console.error('Error fetching statement:', err);
    res.status(500).json({ error: 'خطأ في جلب كشف حساب العميل' });
  }
});

// POST /api/customers/:id/pay - Record debt payment (سند قبض من عميل)
router.post('/:id/pay', authenticateToken, requirePermission('manage_customers'), async (req, res) => {
  try {
    const id = req.params.id;
    const { amount, paymentDate = new Date().toISOString().slice(0, 10), paymentMethod = 'cash', notes = '' } = req.body;
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال مبلغ صحيح أكبر من الصفر' });
    }

    const customer = await db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    await db.transaction(async (tx) => {
      await tx.prepare(`
        INSERT INTO customer_payments (customer_id, amount, payment_date, payment_method, notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, amt, paymentDate, paymentMethod, notes);

      await tx.prepare('UPDATE customers SET balance = balance - ? WHERE id = ?').run(amt, id);

      logAudit(
        req.user.id,
        req.user.username,
        'CUSTOMER_PAYMENT',
        `تحصيل دفعة نقدية من العميل ${customer.name} بقيمة ${amt.toFixed(2)} ج.م (${paymentMethod})`,
        req.ip
      );
    });

    res.json({ success: true, message: `تم تسجيل سند القبض بنجاح وتحديث مديونية العميل ${customer.name}` });
  } catch (err) {
    console.error('Error paying customer:', err);
    res.status(500).json({ error: 'خطأ في تسجيل سند القبض' });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', authenticateToken, requirePermission('manage_customers'), async (req, res) => {
  try {
    const id = req.params.id;
    const salesCountRes = await db.prepare('SELECT COUNT(*) as count FROM sales WHERE customer_id = ?').get(id);
    const salesCount = salesCountRes ? parseInt(salesCountRes.count) : 0;
    if (salesCount > 0) {
      return res.status(400).json({ error: `لا يمكن حذف هذا العميل لوجود ${salesCount} فاتورة مسجلة باسمه` });
    }

    await db.prepare('DELETE FROM customer_payments WHERE customer_id = ?').run(id);
    await db.prepare('DELETE FROM customers WHERE id = ?').run(id);

    logAudit(req.user.id, req.user.username, 'CUSTOMER_DELETED', `حذف عميل رقم ${id}`, req.ip);
    res.json({ success: true, message: 'تم حذف العميل بنجاح' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'خطأ في حذف العميل' });
  }
});

module.exports = router;
