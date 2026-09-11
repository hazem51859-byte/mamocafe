const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/products - List products with rich filtering
router.get('/', authenticateToken, (req, res) => {
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
    query += ` AND (p.name LIKE ? OR p.barcode LIKE ? OR p.sku LIKE ?)`;
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
    query += ` AND p.expiry_date IS NOT NULL AND p.expiry_date <= date('now')`;
  }

  query += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const products = db.prepare(query).all(...params);

  // Total count
  let countQuery = `SELECT COUNT(*) as count FROM products p WHERE 1=1`;
  const countParams = [];
  if (search.trim()) {
    const s = `%${search.trim()}%`;
    countQuery += ` AND (p.name LIKE ? OR p.barcode LIKE ? OR p.sku LIKE ?)`;
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
    countQuery += ` AND p.expiry_date IS NOT NULL AND p.expiry_date <= date('now')`;
  }
  const totalCount = db.prepare(countQuery).get(...countParams).count;

  // Attach units to each product
  products.forEach(p => {
    p.units = db.prepare('SELECT * FROM product_units WHERE product_id = ?').all(p.id);
  });

  res.json({
    products,
    total: totalCount
  });
});

// GET /api/products/:id - Single product with units
router.get('/:id', authenticateToken, (req, res) => {
  const product = db.prepare(`
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

  product.units = db.prepare('SELECT * FROM product_units WHERE product_id = ?').all(product.id);
  res.json(product);
});

// POST /api/products - Add product
router.post('/', authenticateToken, requirePermission('manage_products'), (req, res) => {
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
  const existing = db.prepare('SELECT id FROM products WHERE barcode = ?').get(barcode.trim());
  if (existing) {
    return res.status(400).json({ error: 'هذا الباركود مستخدم بالفعل لمنتج آخر' });
  }

  try {
    const addProductTx = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO products (
          barcode, sku, name, category_id, brand_id, unit, purchase_price,
          selling_price, wholesale_price, min_price, tax_percent, stock_quantity,
          min_stock_alert, expiry_date, supplier_id, is_weight, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
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
        const unitStmt = db.prepare(`
          INSERT INTO product_units (product_id, unit_name, conversion_factor, selling_price, barcode)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const u of units) {
          if (u.unitName && u.conversionFactor && u.sellingPrice) {
            unitStmt.run(productId, u.unitName, parseFloat(u.conversionFactor), parseFloat(u.sellingPrice), u.barcode || null);
          }
        }
      }

      // Record initial inventory movement if quantity > 0
      if (parseFloat(stockQuantity) > 0) {
        db.prepare(`
          INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes, user_id)
          VALUES (?, 'initial', ?, 'setup', 'رصيد افتتاحي عند إضافة المنتج', ?)
        `).run(productId, parseFloat(stockQuantity), req.user.id);
      }

      logAudit(req.user.id, req.user.username, 'PRODUCT_ADDED', `إضافة منتج جديد: ${name} (باركود: ${barcode})`, req.ip);

      return productId;
    });

    const newId = addProductTx();
    res.json({ success: true, message: 'تمت إضافة المنتج بنجاح', id: newId });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء حفظ المنتج' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticateToken, requirePermission('manage_products'), (req, res) => {
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

  const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!current) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }

  // Unique barcode check if changed
  if (barcode && barcode.trim() !== current.barcode) {
    const existing = db.prepare('SELECT id FROM products WHERE barcode = ? AND id != ?').get(barcode.trim(), id);
    if (existing) {
      return res.status(400).json({ error: 'هذا الباركود مستخدم بالفعل لمنتج آخر' });
    }
  }

  try {
    const updateTx = db.transaction(() => {
      db.prepare(`
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
        db.prepare('DELETE FROM product_units WHERE product_id = ?').run(id);
        const unitStmt = db.prepare(`
          INSERT INTO product_units (product_id, unit_name, conversion_factor, selling_price, barcode)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const u of units) {
          if (u.unitName && u.conversionFactor && u.sellingPrice) {
            unitStmt.run(id, u.unitName, parseFloat(u.conversionFactor), parseFloat(u.sellingPrice), u.barcode || null);
          }
        }
      }

      logAudit(req.user.id, req.user.username, 'PRODUCT_EDITED', `تعديل بيانات المنتج ${name || current.name} (رقم: ${id})`, req.ip);
    });

    updateTx();
    res.json({ success: true, message: 'تم تحديث المنتج بنجاح' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ أثناء تعديل المنتج' });
  }
});

// POST /api/products/:id/adjust-stock - Quick stock adjustment
router.post('/:id/adjust-stock', authenticateToken, requirePermission('stock_adjustments'), (req, res) => {
  const id = req.params.id;
  const { newQuantity, reason = 'تسوية جردية' } = req.body;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }

  const targetQty = parseFloat(newQuantity);
  if (isNaN(targetQty) || targetQty < 0) {
    return res.status(400).json({ error: 'يرجى إدخال كمية صحيحة غير سالبة' });
  }

  const diff = targetQty - product.stock_quantity;
  if (diff === 0) {
    return res.json({ success: true, message: 'الكمية متطابقة بالفعل' });
  }

  const movementType = diff > 0 ? 'adjustment_in' : 'adjustment_out';

  const adjustTx = db.transaction(() => {
    db.prepare('UPDATE products SET stock_quantity = ? WHERE id = ?').run(targetQty, id);
    db.prepare(`
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

  adjustTx();
  res.json({ success: true, message: 'تم تعديل الرصيد بنجاح', newQuantity: targetQty });
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticateToken, requirePermission('manage_products'), (req, res) => {
  const id = req.params.id;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) {
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }

  // Check if product is tied to sales
  const salesCount = db.prepare('SELECT COUNT(*) as count FROM sale_items WHERE product_id = ?').get(id).count;
  if (salesCount > 0) {
    // Soft delete
    db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
    logAudit(req.user.id, req.user.username, 'PRODUCT_DEACTIVATED', `تعطيل المنتج ${product.name} لارتباطه بمبيعات سابقة`, req.ip);
    return res.json({ success: true, message: 'تم تعطيل المنتج وإخفائه من قائمة البيع نظراً لوجود مبيعات مرتبطة به' });
  }

  // Hard delete
  db.prepare('DELETE FROM product_units WHERE product_id = ?').run(id);
  db.prepare('DELETE FROM inventory_movements WHERE product_id = ?').run(id);
  db.prepare('DELETE FROM products WHERE id = ?').run(id);

  logAudit(req.user.id, req.user.username, 'PRODUCT_DELETED', `حذف نهائي للمنتج ${product.name} (رقم: ${id})`, req.ip);

  res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
});

module.exports = router;
