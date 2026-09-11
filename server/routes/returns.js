const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/returns - List returns
router.get('/', authenticateToken, (req, res) => {
  const returns = db.prepare(`
    SELECT r.*, u.full_name as cashier_name, c.name as customer_name,
           (SELECT COUNT(*) FROM return_items WHERE return_id = r.id) as items_count
    FROM returns r
    JOIN users u ON r.cashier_id = u.id
    LEFT JOIN customers c ON r.customer_id = c.id
    ORDER BY r.id DESC
    LIMIT 100
  `).all();

  res.json(returns);
});

// GET /api/returns/invoice-lookup/:invoiceNumber - Find sale to return
router.get('/invoice-lookup/:invoiceNumber', authenticateToken, (req, res) => {
  const inv = req.params.invoiceNumber.trim();
  const sale = db.prepare(`
    SELECT s.*, u.full_name as cashier_name, c.name as customer_name
    FROM sales s
    JOIN users u ON s.cashier_id = u.id
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.invoice_number = ?
  `).get(inv);

  if (!sale) {
    return res.status(404).json({ error: 'لم يتم العثور على فاتورة بهذا الرقم' });
  }

  const items = db.prepare(`
    SELECT si.*,
           COALESCE((
             SELECT SUM(ri.quantity)
             FROM return_items ri
             JOIN returns r ON ri.return_id = r.id
             WHERE r.sale_id = si.sale_id AND ri.product_id = si.product_id
           ), 0) as already_returned_qty
    FROM sale_items si
    WHERE si.sale_id = ?
  `).all(sale.id);

  sale.items = items.map(i => ({
    ...i,
    available_to_return: Math.max(0, i.quantity - i.already_returned_qty)
  }));

  res.json(sale);
});

// POST /api/returns - Process sale return
router.post('/', authenticateToken, requirePermission('sales_returns'), (req, res) => {
  const {
    saleId,
    invoiceNumber,
    items, // array of { productId, quantity, unitPrice, reason }
    refundMethod = 'cash',
    reason = 'طلب العميل'
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'يرجى تحديد الأصناف المراد إرجاعها والكميات' });
  }

  // Active shift check
  let activeShift = db.prepare(`
    SELECT * FROM shifts WHERE cashier_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1
  `).get(req.user.id);
  if (!activeShift) {
    activeShift = db.prepare(`SELECT * FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1`).get();
  }
  const shiftId = activeShift ? activeShift.id : null;

  try {
    const returnTx = db.transaction(() => {
      let totalRefund = 0;
      const validItems = [];

      for (const itm of items) {
        const qty = parseFloat(itm.quantity);
        if (qty > 0) {
          const price = parseFloat(itm.unitPrice);
          const lineTotal = qty * price;
          totalRefund += lineTotal;
          validItems.push({
            productId: itm.productId,
            name: itm.name,
            quantity: qty,
            unitPrice: price,
            lineTotal
          });
        }
      }

      if (validItems.length === 0) {
        throw new Error('لم يتم تحديد أي كمية موجبة صالحة للإرجاع');
      }

      // Generate Return number: RET-YYMMDD-XXXX
      const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const countToday = db.prepare(`
        SELECT COUNT(*) as count FROM returns WHERE return_number LIKE ?
      `).get(`RET-${todayStr}-%`).count + 1;
      const returnNumber = `RET-${todayStr}-${String(countToday).padStart(4, '0')}`;

      // Get sale details for customer
      let customerId = null;
      if (saleId) {
        const s = db.prepare('SELECT customer_id FROM sales WHERE id = ?').get(saleId);
        if (s) customerId = s.customer_id;
      }

      // Insert into returns
      const insertRet = db.prepare(`
        INSERT INTO returns (
          return_number, sale_id, invoice_number, shift_id, cashier_id, customer_id, total_refund, refund_method, reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const retRes = insertRet.run(
        returnNumber,
        saleId || null,
        invoiceNumber || null,
        shiftId,
        req.user.id,
        customerId,
        totalRefund,
        refundMethod,
        reason
      );
      const returnId = retRes.lastInsertRowid;

      // Insert return items, restore stock, and log inventory movement
      const insertRetItem = db.prepare(`
        INSERT INTO return_items (return_id, product_id, product_name, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const updateStock = db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?');
      const insertMovement = db.prepare(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes, user_id)
        VALUES (?, 'return', ?, 'return', ?, ?, ?)
      `);

      for (const item of validItems) {
        insertRetItem.run(returnId, item.productId, item.name, item.quantity, item.unitPrice, item.lineTotal);
        updateStock.run(item.quantity, item.productId);
        insertMovement.run(item.productId, item.quantity, returnId, `مرتجع مبيعات ${returnNumber} للفاتورة ${invoiceNumber}`, req.user.id);
      }

      // If refunded as credit to customer account
      if (refundMethod === 'credit' && customerId) {
        db.prepare('UPDATE customers SET balance = balance - ? WHERE id = ?').run(totalRefund, customerId);
      }

      logAudit(
        req.user.id,
        req.user.username,
        'SALE_RETURNED',
        `مرتجع مبيعات ${returnNumber} بقيمة ${totalRefund.toFixed(2)} ج.م (الفاتورة: ${invoiceNumber})`,
        req.ip
      );

      return { returnNumber, totalRefund };
    });

    const result = returnTx();
    res.json({
      success: true,
      message: `تم تسجيل المرتجع ${result.returnNumber} بنجاح وإعادة الكميات للمخزن`,
      result
    });
  } catch (err) {
    console.error('Return error:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء معالجة المرتجع' });
  }
});

module.exports = router;
