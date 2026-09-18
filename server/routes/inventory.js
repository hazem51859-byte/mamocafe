const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/inventory/summary - Inventory statistics
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const totals = (await db.prepare(`
      SELECT
        COUNT(id) as total_products,
        COALESCE(SUM(stock_quantity), 0) as total_units,
        COALESCE(SUM(stock_quantity * purchase_price), 0) as valuation_cost,
        COALESCE(SUM(stock_quantity * selling_price), 0) as valuation_retail,
        COALESCE(SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END), 0) as out_of_stock,
        COALESCE(SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= min_stock_alert THEN 1 ELSE 0 END), 0) as low_stock,
        COALESCE(SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE THEN 1 ELSE 0 END), 0) as expired_count,
        COALESCE(SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 ELSE 0 END), 0) as near_expiry_count
      FROM products
      WHERE is_active = 1
    `).get()) || {};

    res.json(totals);
  } catch (err) {
    console.error('Error in inventory summary:', err);
    res.status(500).json({ error: 'خطأ في جلب ملخص المخزون' });
  }
});

// GET /api/inventory/movements - List inventory history
router.get('/movements', authenticateToken, async (req, res) => {
  try {
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

    const movements = await db.prepare(query).all(...params);

    res.json(movements);
  } catch (err) {
    console.error('Error listing inventory movements:', err);
    res.status(500).json({ error: 'خطأ في جلب حركات المخزون' });
  }
});

// POST /api/inventory/stock-in - Manual stock receiving
router.post('/stock-in', authenticateToken, requirePermission('manage_inventory'), async (req, res) => {
  try {
    const { productId, quantity, reason = 'توريد يدوي / استلام إضافي' } = req.body;
    const qty = parseFloat(quantity);

    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال معرف المنتج وكمية صحيحة موجبة' });
    }

    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    await db.transaction(async (tx) => {
      await tx.prepare('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?').run(qty, productId);
      await tx.prepare(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
        VALUES (?, 'purchase', ?, 'manual_stock_in', ?, ?)
      `).run(productId, qty, reason, req.user.id);

      logAudit(req.user.id, req.user.username, 'STOCK_IN', `إذن إضافة مخزني: ${product.name} (+${qty})`, req.ip);
    });

    res.json({ success: true, message: `تمت إضافة ${qty} ${product.unit} إلى رصيد ${product.name}` });
  } catch (err) {
    console.error('Error in stock in:', err);
    res.status(500).json({ error: 'خطأ في إذن الإضافة المخزنية' });
  }
});

// POST /api/inventory/stock-out - Manual stock release / damage / disposal
router.post('/stock-out', authenticateToken, requirePermission('manage_inventory'), async (req, res) => {
  try {
    const { productId, quantity, type = 'damage', reason = 'توالف وتالف في الصالة' } = req.body;
    const qty = parseFloat(quantity);

    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'يرجى إدخال معرف المنتج وكمية صحيحة موجبة' });
    }

    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    await db.transaction(async (tx) => {
      await tx.prepare('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?').run(qty, productId);
      await tx.prepare(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
        VALUES (?, ?, ?, 'manual_stock_out', ?, ?)
      `).run(productId, type, -qty, reason, req.user.id);

      logAudit(req.user.id, req.user.username, 'STOCK_OUT', `إذن صرف مخزني (${type}): ${product.name} (-${qty})`, req.ip);
    });

    res.json({ success: true, message: `تم صرف ${qty} ${product.unit} من رصيد ${product.name}` });
  } catch (err) {
    console.error('Error in stock out:', err);
    res.status(500).json({ error: 'خطأ في إذن الصرف المخزني' });
  }
});

// POST /api/inventory/audit-count - Physical stock count reconciliation
router.post('/audit-count', authenticateToken, requirePermission('stock_adjustments'), async (req, res) => {
  const { items } = req.body; // array of { productId, actualQuantity, reason }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'قائمة الجرد فارغة' });
  }

  try {
    const adjusted = await db.transaction(async (tx) => {
      let adjustedCount = 0;
      for (const item of items) {
        const prod = await tx.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        if (prod) {
          const actual = parseFloat(item.actualQuantity);
          if (!isNaN(actual)) {
            const currentQty = parseFloat(prod.stock_quantity);
            const diff = actual - currentQty;
            if (diff !== 0) {
              await tx.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(actual, prod.id);
              const mType = diff > 0 ? 'adjustment_in' : 'adjustment_out';
              await tx.prepare(`
                INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
                VALUES (?, ?, ?, 'inventory_audit', ?, ?)
              `).run(prod.id, mType, diff, item.reason || `تسوية جرد دوري (دفترى: ${currentQty} -> فعلى: ${actual})`, req.user.id);
              adjustedCount++;
            }
          }
        }
      }

      logAudit(req.user.id, req.user.username, 'INVENTORY_AUDIT_COMPLETED', `اكتمال جرد دوري وتسوية ${adjustedCount} صنف`, req.ip);
      return adjustedCount;
    });

    res.json({ success: true, message: `تمت تسوية الجرد بنجاح لـ ${adjusted} صنف تم تعديل أرصدتها` });
  } catch (err) {
    console.error('Audit count error:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء حفظ الجرد' });
  }
});

module.exports = router;
