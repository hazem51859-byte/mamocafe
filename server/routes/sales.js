const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/sales - List sales invoices
router.get('/', authenticateToken, (req, res) => {
  const {
    search = '',
    cashierId = '',
    customerId = '',
    paymentMethod = '',
    startDate = '',
    endDate = '',
    limit = 50,
    offset = 0
  } = req.query;

  let query = `
    SELECT s.*, u.full_name as cashier_name, c.name as customer_name,
           (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as items_count
    FROM sales s
    JOIN users u ON s.cashier_id = u.id
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (search.trim()) {
    query += ` AND (s.invoice_number LIKE ? OR c.name LIKE ?)`;
    const s = `%${search.trim()}%`;
    params.push(s, s);
  }

  if (cashierId) {
    query += ` AND s.cashier_id = ?`;
    params.push(cashierId);
  }

  if (customerId) {
    query += ` AND s.customer_id = ?`;
    params.push(customerId);
  }

  if (paymentMethod) {
    query += ` AND s.payment_method = ?`;
    params.push(paymentMethod);
  }

  if (startDate) {
    query += ` AND date(s.created_at) >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND date(s.created_at) <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY s.id DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const sales = db.prepare(query).all(...params);

  // Total summary for this filter
  let summaryQuery = `
    SELECT COUNT(*) as total_invoices,
           SUM(grand_total) as total_sales,
           SUM(discount_amount) as total_discounts,
           SUM(tax_amount) as total_tax
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE 1=1
  `;
  const summaryParams = [];
  if (search.trim()) {
    summaryQuery += ` AND (s.invoice_number LIKE ? OR c.name LIKE ?)`;
    const s = `%${search.trim()}%`;
    summaryParams.push(s, s);
  }
  if (cashierId) {
    summaryQuery += ` AND s.cashier_id = ?`;
    summaryParams.push(cashierId);
  }
  if (customerId) {
    summaryQuery += ` AND s.customer_id = ?`;
    summaryParams.push(customerId);
  }
  if (paymentMethod) {
    summaryQuery += ` AND s.payment_method = ?`;
    summaryParams.push(paymentMethod);
  }
  if (startDate) {
    summaryQuery += ` AND date(s.created_at) >= ?`;
    summaryParams.push(startDate);
  }
  if (endDate) {
    summaryQuery += ` AND date(s.created_at) <= ?`;
    summaryParams.push(endDate);
  }

  const summary = db.prepare(summaryQuery).get(...summaryParams);

  res.json({ sales, summary });
});

// GET /api/sales/:id - Single sale invoice with all line items
router.get('/:id', authenticateToken, (req, res) => {
  const sale = db.prepare(`
    SELECT s.*, u.full_name as cashier_name, c.name as customer_name, c.phone as customer_phone, c.address as customer_address
    FROM sales s
    JOIN users u ON s.cashier_id = u.id
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.id = ? OR s.invoice_number = ?
  `).get(req.params.id, req.params.id);

  if (!sale) {
    return res.status(404).json({ error: 'الفاتورة غير موجودة' });
  }

  const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(sale.id);
  sale.items = items;

  // Check if invoice has returns
  const returns = db.prepare('SELECT * FROM returns WHERE sale_id = ?').all(sale.id);
  sale.returns = returns;

  res.json(sale);
});

module.exports = router;
