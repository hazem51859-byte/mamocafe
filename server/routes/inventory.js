const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/inventory/summary - Inventory statistics
router.get('/summary', authenticateToken, (req, res) => {
  const totals = db.prepare(`
    SELECT
      COUNT(id) as total_products,
      SUM(stock_quantity) as total_units,
      SUM(stock_quantity * purchase_price) as valuation_cost,
      SUM(stock_quantity * selling_price) as valuation_retail,
      SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= min_stock_alert THEN 1 ELSE 0 END) as low_stock,
      SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date <= date('now') THEN 1 ELSE 0 END) as expired_count,
      SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date > date('now') AND expiry_date <= date('now', '+30 days') THEN 1 ELSE 0 END) as near_expiry_count
    FROM products
    WHERE is_active = 1
  `).get();

  res.json(totals);
});

// GET /api/inventory/movements - List inventory history
router.get('/movements', authenticateToken, (req, res) => {
  const { productId, type, startDate, endDate, limit = 100, offset = 0 } = req.query;

  let query = `
    SELECT m.*, p.name as product_name, p.barcode as product_barcode, p.unit as product_unit,
           u.full_name as user_full_name
    FROM inventory_movements m
    JOIN products p ON m.product_id = p.id
    LEFT JOIN users u ON m.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (productId) {
    query += ` AND m.product_id = ?`;
    params.push(productId);
  }

  if (type) {
    query += ` AND m.movement_type = ?`;
    params.push(type);
  }

  if (startDate) {
    query += ` AND date(m.created_at) >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND date(m.created_at) <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY m.id DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const movements = db.prepare(query).all(...params);

  res.json(movements);
});

// POST /api/inventory/stock-in - Manual stock receiving
router.post('/stock-in', authenticateToken, requirePermission('manage_inventory'), (req, res) => {
  const { productId, quantity, reason = 'توريد يدوي / استلام إضافي' } = req.body;
  const qty = parseFloat(quantity);

  if (!productId || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'يرجى إدخال معرف المنتج وكمية صحيحة موجبة' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?').run(qty, productId);
    db.prepare(`
      INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
      VALUES (?, 'purchase', ?, 'manual_stock_in', ?, ?)
    `).run(productId, qty, reason, req.user.id);

    logAudit(req.user.id, req.user.username, 'STOCK_IN', `إذن إضافة مخزني: ${product.name} (+${qty})`, req.ip);
  });

  tx();
  res.json({ success: true, message: `تمت إضافة ${qty} ${product.unit} إلى رصيد ${product.name}` });
});

// POST /api/inventory/stock-out - Manual stock release / damage / disposal
router.post('/stock-out', authenticateToken, requirePermission('manage_inventory'), (req, res) => {
  const { productId, quantity, type = 'damage', reason = 'توالف وتالف في الصالة' } = req.body;
  const qty = parseFloat(quantity);

  if (!productId || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'يرجى إدخال معرف المنتج وكمية صحيحة موجبة' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }

  const tx = db.transaction(() => {
    db.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(qty, productId);
    db.prepare(`
      INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
      VALUES (?, ?, ?, 'manual_stock_out', ?, ?)
    `).run(productId, type, -qty, reason, req.user.id);

    logAudit(req.user.id, req.user.username, 'STOCK_OUT', `إذن صرف مخزني (${type}): ${product.name} (-${qty})`, req.ip);
  });

  tx();
  res.json({ success: true, message: `تم صرف ${qty} ${product.unit} من رصيد ${product.name}` });
});

// POST /api/inventory/audit-count - Physical stock count reconciliation
router.post('/audit-count', authenticateToken, requirePermission('stock_adjustments'), (req, res) => {
  const { items } = req.body; // array of { productId, actualQuantity, reason }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'قائمة الجرد فارغة' });
  }

  try {
    const auditTx = db.transaction(() => {
      let adjustedCount = 0;
      for (const item of items) {
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        if (prod) {
          const actual = parseFloat(item.actualQuantity);
          if (!isNaN(actual)) {
            const diff = actual - prod.stock_quantity;
            if (diff !== 0) {
              db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(actual, prod.id);
              const mType = diff > 0 ? 'adjustment_in' : 'adjustment_out';
              db.prepare(`
                INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
                VALUES (?, ?, ?, 'inventory_audit', ?, ?)
              `).run(prod.id, mType, diff, item.reason || `تسوية جرد دوري (دفترى: ${prod.stock_quantity} -> فعلى: ${actual})`, req.user.id);
              adjustedCount++;
            }
          }
        }
      }

      logAudit(req.user.id, req.user.username, 'INVENTORY_AUDIT_COMPLETED', `اكتمال جرد دوري وتسوية ${adjustedCount} صنف`, req.ip);
      return adjustedCount;
    });

    const adjusted = auditTx();
    res.json({ success: true, message: `تمت تسوية الجرد بنجاح لـ ${adjusted} صنف تم تعديل أرصدتها` });
  } catch (err) {
    console.error('Audit count error:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء حفظ الجرد' });
  }
});

module.exports = router;
