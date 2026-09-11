const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/purchases - List purchase invoices
router.get('/', authenticateToken, (req, res) => {
  const { supplierId, startDate, endDate, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT p.*, s.name as supplier_name, s.company as supplier_company,
           (SELECT COUNT(*) FROM purchase_items WHERE purchase_id = p.id) as items_count
    FROM purchases p
    JOIN suppliers s ON p.supplier_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (supplierId) {
    query += ` AND p.supplier_id = ?`;
    params.push(supplierId);
  }
  if (startDate) {
    query += ` AND p.invoice_date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND p.invoice_date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const purchases = db.prepare(query).all(...params);

  // Summary
  const summary = db.prepare(`
    SELECT COUNT(*) as total_invoices,
           SUM(grand_total) as total_amount,
           SUM(paid_amount) as total_paid,
           SUM(remaining_amount) as total_remaining
    FROM purchases
  `).get();

  res.json({ purchases, summary });
});

// GET /api/purchases/:id - Single purchase details
router.get('/:id', authenticateToken, (req, res) => {
  const purchase = db.prepare(`
    SELECT p.*, s.name as supplier_name, s.company as supplier_company, s.phone as supplier_phone
    FROM purchases p
    JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!purchase) {
    return res.status(404).json({ error: 'فاتورة المشتريات غير موجودة' });
  }

  const items = db.prepare('SELECT * FROM purchase_items WHERE purchase_id = ?').all(purchase.id);
  purchase.items = items;

  res.json(purchase);
});

// POST /api/purchases - Create purchase invoice
router.post('/', authenticateToken, requirePermission('manage_purchases'), (req, res) => {
  const {
    supplierId,
    invoiceDate = new Date().toISOString().slice(0, 10),
    items, // array of { productId, quantity, purchasePrice }
    discountAmount = 0,
    taxAmount = 0,
    paidAmount = 0,
    notes = '',
    updateCostPrice = true
  } = req.body;

  if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'يرجى اختيار المورد وتحديد أصناف الفاتورة' });
  }

  try {
    const purchaseTx = db.transaction(() => {
      let subtotal = 0;
      const validItems = [];

      for (const itm of items) {
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(itm.productId);
        if (!prod) {
          throw new Error(`المنتج رقم ${itm.productId} غير موجود`);
        }
        const qty = parseFloat(itm.quantity);
        const cost = parseFloat(itm.purchasePrice);
        const lineTotal = qty * cost;
        subtotal += lineTotal;
        validItems.push({
          productId: prod.id,
          name: prod.name,
          quantity: qty,
          purchasePrice: cost,
          lineTotal
        });
      }

      const disc = parseFloat(discountAmount) || 0;
      const tax = 0;
      const grandTotal = Math.max(0, subtotal - disc);
      const paid = parseFloat(paidAmount) || 0;
      const remaining = Math.max(0, grandTotal - paid);
      const paymentStatus = remaining <= 0 ? 'paid' : (paid > 0 ? 'partial' : 'unpaid');

      // Unique purchase invoice number: PUR-YYMMDD-XXXX
      const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const countToday = db.prepare('SELECT COUNT(*) as count FROM purchases WHERE invoice_number LIKE ?').get(`PUR-${todayStr}-%`).count + 1;
      const invoiceNumber = `PUR-${todayStr}-${String(countToday).padStart(4, '0')}`;

      // Insert purchase
      const insertPurch = db.prepare(`
        INSERT INTO purchases (
          invoice_number, supplier_id, invoice_date, subtotal, discount_amount,
          tax_amount, grand_total, paid_amount, remaining_amount, payment_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const resPurch = insertPurch.run(
        invoiceNumber,
        supplierId,
        invoiceDate,
        subtotal,
        disc,
        tax,
        grandTotal,
        paid,
        remaining,
        paymentStatus,
        notes
      );
      const purchaseId = resPurch.lastInsertRowid;

      // Insert items, update stock and purchase price
      const insertItem = db.prepare(`
        INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, purchase_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity + ? ${updateCostPrice ? ', purchase_price = ?' : ''} WHERE id = ?
      `);

      const insertMovement = db.prepare(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, user_id)
        VALUES (?, 'purchase', ?, 'purchase', ?, ?, ?)
      `);

      for (const item of validItems) {
        insertItem.run(purchaseId, item.productId, item.name, item.quantity, item.purchasePrice, item.lineTotal);
        if (updateCostPrice) {
          updateStock.run(item.quantity, item.purchasePrice, item.productId);
        } else {
          updateStock.run(item.quantity, item.productId);
        }
        insertMovement.run(item.productId, item.quantity, purchaseId, `فاتورة مشتريات ${invoiceNumber}`, req.user.id);
      }

      // Update supplier balance if remaining amount > 0
      if (remaining > 0) {
        db.prepare('UPDATE suppliers SET current_balance = current_balance + ? WHERE id = ?').run(remaining, supplierId);
      }

      logAudit(
        req.user.id,
        req.user.username,
        'PURCHASE_CREATED',
        `فاتورة مشتريات ${invoiceNumber} بإجمالي ${grandTotal.toFixed(2)} ج.م (المدفوع: ${paid.toFixed(2)}, المتبقي: ${remaining.toFixed(2)})`,
        req.ip
      );

      return { invoiceNumber, purchaseId };
    });

    const result = purchaseTx();
    res.json({
      success: true,
      message: `تم حفظ فاتورة المشتريات ${result.invoiceNumber} وإضافة البضاعة للمخزن بنجاح`,
      result
    });
  } catch (err) {
    console.error('Purchase creation error:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء حفظ فاتورة المشتريات' });
  }
});

module.exports = router;
