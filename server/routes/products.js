const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/products - List products with rich filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      search = '',
      categoryId = '',
      lowStock = '',
      expired = '',
      limit = 100,
      offset = 0
    } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, b.name as brand_name, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search.trim()) {
      const s = `%${search.trim()}%`;
      query += ` AND (p.name ILIKE ? OR p.barcode ILIKE ? OR p.sku ILIKE ?)`;
      params.push(s, s, s);
    }

    if (categoryId) {
      query += ` AND p.category_id = ?`;
      params.push(categoryId);
    }

    if (lowStock === '1' || lowStock === 'true') {
      query += ` AND p.stock_quantity <= p.min_stock_alert`;
    }

    if (expired === '1' || expired === 'true') {
      query += ` AND p.expiry_date IS NOT NULL AND p.expiry_date <= CURRENT_DATE`;
    }

    query += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const products = await db.prepare(query).all(...params);

    // Total count
    let countQuery = `SELECT COUNT(*) as count FROM products p WHERE 1=1`;
    const countParams = [];
    if (search.trim()) {
      const s = `%${search.trim()}%`;
      countQuery += ` AND (p.name ILIKE ? OR p.barcode ILIKE ? OR p.sku ILIKE ?)`;
      countParams.push(s, s, s);
    }
    if (categoryId) {
      countQuery += ` AND p.category_id = ?`;
      countParams.push(categoryId);
    }
    if (lowStock === '1' || lowStock === 'true') {
      countQuery += ` AND p.stock_quantity <= p.min_stock_alert`;
    }
    if (expired === '1' || expired === 'true') {
      countQuery += ` AND p.expiry_date IS NOT NULL AND p.expiry_date <= CURRENT_DATE`;
    }
    const countRes = await db.prepare(countQuery).get(...countParams);
    const totalCount = countRes ? parseInt(countRes.count) : 0;

    // Detailed inventory valuation stats for current filter
    let statsQuery = `
      SELECT 
        COUNT(p.id) as total_products,
        COALESCE(SUM(p.stock_quantity), 0) as total_stock_qty,
        COALESCE(SUM(CASE WHEN p.stock_quantity > 0 THEN p.stock_quantity * p.purchase_price ELSE 0 END), 0) as total_cost_value,
        COALESCE(SUM(CASE WHEN p.stock_quantity > 0 THEN p.stock_quantity * p.selling_price ELSE 0 END), 0) as total_selling_value
      FROM products p
      WHERE 1=1
    `;
    const statsParams = [];
    if (search.trim()) {
      const s = `%${search.trim()}%`;
      statsQuery += ` AND (p.name ILIKE ? OR p.barcode ILIKE ? OR p.sku ILIKE ?)`;
      statsParams.push(s, s, s);
    }
    if (categoryId) {
      statsQuery += ` AND p.category_id = ?`;
      statsParams.push(categoryId);
    }
    if (lowStock === '1' || lowStock === 'true') {
      statsQuery += ` AND p.stock_quantity <= p.min_stock_alert`;
    }
    if (expired === '1' || expired === 'true') {
      statsQuery += ` AND p.expiry_date IS NOT NULL AND p.expiry_date <= CURRENT_DATE`;
    }

    const rawStats = (await db.prepare(statsQuery).get(...statsParams)) || {};
    const costVal = Number(rawStats.total_cost_value || 0);
    const sellVal = Number(rawStats.total_selling_value || 0);
    const profit = sellVal - costVal;
    const margin = sellVal > 0 ? (profit / sellVal) * 100 : 0;

    // Overall store inventory valuation (unfiltered)
    const rawOverall = (await db.prepare(`
      SELECT 
        COUNT(id) as total_products,
        COALESCE(SUM(stock_quantity), 0) as total_stock_qty,
        COALESCE(SUM(CASE WHEN stock_quantity > 0 THEN stock_quantity * purchase_price ELSE 0 END), 0) as total_cost_value,
        COALESCE(SUM(CASE WHEN stock_quantity > 0 THEN stock_quantity * selling_price ELSE 0 END), 0) as total_selling_value
      FROM products
    `).get()) || {};
    const overallCost = Number(rawOverall.total_cost_value || 0);
    const overallSell = Number(rawOverall.total_selling_value || 0);
    const overallProfit = overallSell - overallCost;
    const overallMargin = overallSell > 0 ? (overallProfit / overallSell) * 100 : 0;

    const inventoryStats = {
      totalProducts: parseInt(rawStats.total_products || 0),
      totalStockQty: Number(rawStats.total_stock_qty || 0),
      totalCostValue: costVal,
      totalSellingValue: sellVal,
      expectedProfit: profit,
      profitMargin: margin,
      isFiltered: Boolean(search.trim() || categoryId || lowStock || expired),
      overall: {
        totalProducts: parseInt(rawOverall.total_products || 0),
        totalStockQty: Number(rawOverall.total_stock_qty || 0),
        totalCostValue: overallCost,
        totalSellingValue: overallSell,
        expectedProfit: overallProfit,
        profitMargin: overallMargin
      }
    };

    // Attach units to each product
    for (const p of products) {
      p.units = await db.prepare('SELECT * FROM product_units WHERE product_id = ?').all(p.id);
    }

    res.json({
      products,
      total: totalCount,
      inventoryStats
    });
  } catch (err) {
    console.error('Error listing products:', err);
    res.status(500).json({ error: 'خطأ في جلب المنتجات' });
  }
});

// GET /api/products/:id - Single product with units
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await db.prepare(`
      SELECT p.*, c.name as category_name, b.name as brand_name, s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    product.units = await db.prepare('SELECT * FROM product_units WHERE product_id = ?').all(product.id);
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'خطأ في جلب بيانات المنتج' });
  }
});

// POST /api/products - Add product
router.post('/', authenticateToken, requirePermission('manage_products'), async (req, res) => {
  const {
    barcode,
    sku,
    name,
    categoryId,
    brandId,
    unit = 'قطعة',
    purchasePrice,
    sellingPrice,
    wholesalePrice,
    minPrice,
    taxPercent = 0,
    stockQuantity = 0,
    minStockAlert = 5,
    expiryDate,
    supplierId,
    isWeight = 0,
    notes = '',
    units = []
  } = req.body;

  if (!name || !barcode || purchasePrice === undefined || sellingPrice === undefined) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المنتج، والباركود، وسعر الشراء وسعر البيع' });
  }

  // Barcode uniqueness check
  const existing = await db.prepare('SELECT id FROM products WHERE barcode = ?').get(barcode.trim());
  if (existing) {
    return res.status(400).json({ error: 'هذا الباركود مستخدم بالفعل لمنتج آخر' });
  }

  try {
    const newId = await db.transaction(async (tx) => {
      const stmt = tx.prepare(`
        INSERT INTO products (
          barcode, sku, name, category_id, brand_id, unit, purchase_price,
          selling_price, wholesale_price, min_price, tax_percent, stock_quantity,
          min_stock_alert, expiry_date, supplier_id, is_weight, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = await stmt.run(
        barcode.trim(),
        sku ? sku.trim() : null,
        name.trim(),
        categoryId || null,
        brandId || null,
        unit,
        parseFloat(purchasePrice),
        parseFloat(sellingPrice),
        wholesalePrice ? parseFloat(wholesalePrice) : null,
        minPrice ? parseFloat(minPrice) : null,
        parseFloat(taxPercent) || 0,
        parseFloat(stockQuantity) || 0,
        parseFloat(minStockAlert) || 5,
        expiryDate || null,
        supplierId || null,
        isWeight ? 1 : 0,
        notes
      );

      const productId = result.lastInsertRowid;

      // Insert additional units if any
      if (Array.isArray(units) && units.length > 0) {
        const unitStmt = tx.prepare(`
          INSERT INTO product_units (product_id, unit_name, conversion_factor, selling_price, barcode)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const u of units) {
          if (u.unitName && u.conversionFactor && u.sellingPrice) {
            await unitStmt.run(productId, u.unitName, parseFloat(u.conversionFactor), parseFloat(u.sellingPrice), u.barcode || null);
          }
        }
      }

      // Record initial inventory movement if quantity > 0
      if (parseFloat(stockQuantity) > 0) {
        await tx.prepare(`
          INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
          VALUES (?, 'initial', ?, 'setup', 'رصيد افتتاحي عند إضافة المنتج', ?)
        `).run(productId, parseFloat(stockQuantity), req.user.id);
      }

      logAudit(req.user.id, req.user.username, 'PRODUCT_ADDED', `إضافة منتج جديد: ${name} (باركود: ${barcode})`, req.ip);

      return productId;
    });

    res.json({ success: true, message: 'تمت إضافة المنتج بنجاح', id: newId });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء حفظ المنتج' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticateToken, requirePermission('manage_products'), async (req, res) => {
  const id = req.params.id;
  const {
    barcode,
    sku,
    name,
    categoryId,
    brandId,
    unit,
    purchasePrice,
    sellingPrice,
    wholesalePrice,
    minPrice,
    taxPercent,
    minStockAlert,
    expiryDate,
    supplierId,
    isWeight,
    notes,
    units = []
  } = req.body;

  const current = await db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }

  // Unique barcode check if changed
  if (barcode && barcode.trim() !== current.barcode) {
    const existing = await db.prepare('SELECT id FROM products WHERE barcode = ? AND id != ?').get(barcode.trim(), id);
    if (existing) {
      return res.status(400).json({ error: 'هذا الباركود مستخدم بالفعل لمنتج آخر' });
    }
  }

  try {
    await db.transaction(async (tx) => {
      await tx.prepare(`
        UPDATE products SET
          barcode = ?, sku = ?, name = ?, category_id = ?, brand_id = ?, unit = ?,
          purchase_price = ?, selling_price = ?, wholesale_price = ?, min_price = ?,
          tax_percent = ?, min_stock_alert = ?, expiry_date = ?, supplier_id = ?,
          is_weight = ?, notes = ?
        WHERE id = ?
      `).run(
        barcode ? barcode.trim() : current.barcode,
        sku !== undefined ? sku : current.sku,
        name ? name.trim() : current.name,
        categoryId !== undefined ? categoryId : current.category_id,
        brandId !== undefined ? brandId : current.brand_id,
        unit || current.unit,
        purchasePrice !== undefined ? parseFloat(purchasePrice) : current.purchase_price,
        sellingPrice !== undefined ? parseFloat(sellingPrice) : current.selling_price,
        wholesalePrice !== undefined ? parseFloat(wholesalePrice) : current.wholesale_price,
        minPrice !== undefined ? parseFloat(minPrice) : current.min_price,
        taxPercent !== undefined ? parseFloat(taxPercent) : current.tax_percent,
        minStockAlert !== undefined ? parseFloat(minStockAlert) : current.min_stock_alert,
        expiryDate !== undefined ? expiryDate : current.expiry_date,
        supplierId !== undefined ? supplierId : current.supplier_id,
        isWeight !== undefined ? (isWeight ? 1 : 0) : current.is_weight,
        notes !== undefined ? notes : current.notes,
        id
      );

      // Refresh units
      if (Array.isArray(units)) {
        await tx.prepare('DELETE FROM product_units WHERE product_id = ?').run(id);
        const unitStmt = tx.prepare(`
          INSERT INTO product_units (product_id, unit_name, conversion_factor, selling_price, barcode)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const u of units) {
          if (u.unitName && u.conversionFactor && u.sellingPrice) {
            await unitStmt.run(id, u.unitName, parseFloat(u.conversionFactor), parseFloat(u.sellingPrice), u.barcode || null);
          }
        }
      }

      logAudit(req.user.id, req.user.username, 'PRODUCT_EDITED', `تعديل بيانات المنتج ${name || current.name} (رقم: ${id})`, req.ip);
    });

    res.json({ success: true, message: 'تم تحديث المنتج بنجاح' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء تعديل المنتج' });
  }
});

// POST /api/products/:id/adjust-stock - Quick stock adjustment
router.post('/:id/adjust-stock', authenticateToken, requirePermission('stock_adjustments'), async (req, res) => {
  try {
    const id = req.params.id;
    const { newQuantity, reason = 'تسوية جردية' } = req.body;

    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    const targetQty = parseFloat(newQuantity);
    if (isNaN(targetQty) || targetQty < 0) {
      return res.status(400).json({ error: 'يرجى إدخال كمية صحيحة غير سالبة' });
    }

    const diff = targetQty - parseFloat(product.stock_quantity);
    if (diff === 0) {
      return res.json({ success: true, message: 'الكمية متطابقة بالفعل' });
    }

    const movementType = diff > 0 ? 'adjustment_in' : 'adjustment_out';

    await db.transaction(async (tx) => {
      await tx.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(targetQty, id);
      await tx.prepare(`
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
        VALUES (?, ?, ?, 'manual_adjustment', ?, ?)
      `).run(id, movementType, diff, `${reason} (الرصيد السابق: ${product.stock_quantity}, الجديد: ${targetQty})`, req.user.id);

      logAudit(
        req.user.id,
        req.user.username,
        'STOCK_ADJUSTED',
        `تسوية رصيد ${product.name}: من ${product.stock_quantity} إلى ${targetQty} (${reason})`,
        req.ip
      );
    });

    res.json({ success: true, message: 'تم تعديل الرصيد بنجاح', newQuantity: targetQty });
  } catch (err) {
    console.error('Error adjusting stock:', err);
    res.status(500).json({ error: 'خطأ في تسوية الرصيد' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticateToken, requirePermission('manage_products'), async (req, res) => {
  try {
    const id = req.params.id;
    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    // Check if product is tied to sales
    const salesRes = await db.prepare('SELECT COUNT(*) as count FROM sale_items WHERE product_id = ?').get(id);
    const salesCount = salesRes ? parseInt(salesRes.count) : 0;
    if (salesCount > 0) {
      // Soft delete
      await db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
      logAudit(req.user.id, req.user.username, 'PRODUCT_DEACTIVATED', `تعطيل المنتج ${product.name} لارتباطه بمبيعات سابقة`, req.ip);
      return res.json({ success: true, message: 'تم تعطيل المنتج وإخفائه من قائمة البيع نظراً لوجود مبيعات مرتبطة به' });
    }

    // Hard delete
    await db.prepare('DELETE FROM product_units WHERE product_id = ?').run(id);
    await db.prepare('DELETE FROM inventory_movements WHERE product_id = ?').run(id);
    await db.prepare('DELETE FROM products WHERE id = ?').run(id);

    logAudit(req.user.id, req.user.username, 'PRODUCT_DELETED', `حذف نهائي للمنتج ${product.name} (رقم: ${id})`, req.ip);

    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'خطأ في حذف المنتج' });
  }
});

module.exports = router;
