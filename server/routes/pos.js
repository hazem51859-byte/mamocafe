const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/pos/search - Fast search by barcode, name, SKU
router.get('/search', authenticateToken, (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    // Return top 20 active products for quick pick
    const products = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.id ASC
      LIMIT 24
    `).all();

    return res.json(products);
  }

  // Check exact barcode match first
  const exactBarcode = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.barcode = ? AND p.is_active = 1
  `).get(query);

  if (exactBarcode) {
    // Fetch units if any
    const units = db.prepare('SELECT * FROM product_units WHERE product_id = ?').all(exactBarcode.id);
    exactBarcode.units = units;
    return res.json([exactBarcode]);
  }

  // Also check if barcode belongs to a product_unit
  const unitMatch = db.prepare(`
    SELECT pu.*, p.name as product_name, p.barcode as main_barcode, p.purchase_price, p.tax_percent, p.stock_quantity
    FROM product_units pu
    JOIN products p ON pu.product_id = p.id
    WHERE pu.barcode = ? AND p.is_active = 1
  `).get(query);

  if (unitMatch) {
    const parentProd = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(unitMatch.product_id);
    parentProd.units = db.prepare('SELECT * FROM product_units WHERE product_id = ?').all(parentProd.id);
    parentProd.selectedUnit = unitMatch;
    return res.json([parentProd]);
  }

  // Partial search by name or barcode or SKU
  const searchPattern = `%${query}%`;
  const products = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE (p.name LIKE ? OR p.barcode LIKE ? OR p.sku LIKE ?) AND p.is_active = 1
    ORDER BY p.name ASC
    LIMIT 30
  `).all(searchPattern, searchPattern, searchPattern);

  // Attach units
  products.forEach(p => {
    p.units = db.prepare('SELECT * FROM product_units WHERE product_id = ?').all(p.id);
  });

  res.json(products);
});

// POST /api/pos/checkout - Complete sale transaction
router.post('/checkout', authenticateToken, requirePermission('pos_checkout'), (req, res) => {
  const {
    items,
    customerId,
    discountAmount = 0,
    paymentMethod = 'cash',
    paymentDetails = {},
    paidAmount = 0,
    notes = ''
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'الفاتورة فارغة، يرجى إضافة أصناف أولاً' });
  }

  // Find active shift for cashier (or system open shift)
  let activeShift = db.prepare(`
    SELECT * FROM shifts WHERE cashier_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1
  `).get(req.user.id);

  if (!activeShift) {
    // If no shift for this cashier, look for any open shift or auto-create one
    activeShift = db.prepare(`
      SELECT * FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1
    `).get();

    if (!activeShift) {
      // Auto open shift with 0 cash to avoid blocking cashier
      const shiftStmt = db.prepare(`
        INSERT INTO shifts (cashier_id, opening_cash, status, notes)
        VALUES (?, 0, 'open', 'شيفت تلقائي فتح أثناء البيع')
      `);
      const shiftResult = shiftStmt.run(req.user.id);
      activeShift = { id: shiftResult.lastInsertRowid };
    }
  }

  const shiftId = activeShift ? activeShift.id : null;

  try {
    const saleTransaction = db.transaction(() => {
      // 1. Calculate totals
      let subtotal = 0;
      let totalTax = 0;
      const validatedItems = [];

      for (const item of items) {
        const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
        if (!prod) {
          throw new Error(`المنتج رقم ${item.productId} غير موجود`);
        }

        const qty = parseFloat(item.quantity) || 1;
        const unitPrice = parseFloat(item.unitPrice) || prod.selling_price;
        const lineDiscount = parseFloat(item.discountAmount) || 0;
        const lineTotal = (qty * unitPrice) - lineDiscount;
        subtotal += lineTotal;
        const taxRate = 0;
        const lineTax = 0;

        validatedItems.push({
          productId: prod.id,
          name: prod.name,
          barcode: prod.barcode,
          unit: item.unit || prod.unit,
          conversionFactor: item.conversionFactor || 1,
          quantity: qty,
          unitPrice,
          purchasePrice: prod.purchase_price,
          discountAmount: lineDiscount,
          taxAmount: lineTax,
          lineTotal,
          currentStock: prod.stock_quantity
        });
      }

      const totalDiscount = parseFloat(discountAmount) || 0;
      const grandTotal = Math.max(0, subtotal - totalDiscount);
      const paid = parseFloat(paidAmount) || grandTotal;
      const change = Math.max(0, paid - grandTotal);
      const remaining = paymentMethod === 'credit' ? grandTotal : Math.max(0, grandTotal - paid);

      // 2. Generate unique invoice number: INV-YYMMDD-XXXX
      const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const countToday = db.prepare(`
        SELECT COUNT(*) as count FROM sales WHERE invoice_number LIKE ?
      `).get(`INV-${todayStr}-%`).count + 1;
      const invoiceNumber = `INV-${todayStr}-${String(countToday).padStart(4, '0')}`;

      // 3. Insert into sales table
      const insertSale = db.prepare(`
        INSERT INTO sales (
          invoice_number, shift_id, cashier_id, customer_id, subtotal, discount_amount,
          tax_amount, grand_total, paid_amount, change_amount, remaining_amount,
          payment_method, payment_details, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const saleRes = insertSale.run(
        invoiceNumber,
        shiftId,
        req.user.id,
        customerId || null,
        subtotal,
        totalDiscount,
        totalTax,
        grandTotal,
        paid,
        change,
        remaining,
        paymentMethod,
        typeof paymentDetails === 'object' ? JSON.stringify(paymentDetails) : paymentDetails,
        'completed',
        notes
      );

      const saleId = saleRes.lastInsertRowid;

      // 4. Insert sale_items and decrement stock
      const insertItem = db.prepare(`
        INSERT INTO sale_items (
          sale_id, product_id, product_name, barcode, unit, quantity,
          unit_price, purchase_price, discount_amount, tax_amount, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
      `);

      const insertMovement = db.prepare(`
        INSERT INTO inventory_movements (
          product_id, movement_type, quantity, reference_type, reference_id, notes, user_id
        ) VALUES (?, 'sale', ?, 'sale', ?, ?, ?)
      `);

      for (const item of validatedItems) {
        insertItem.run(
          saleId,
          item.productId,
          item.name,
          item.barcode,
          item.unit,
          item.quantity,
          item.unitPrice,
          item.purchasePrice,
          item.discountAmount,
          item.taxAmount,
          item.lineTotal
        );

        // Effective stock deduction (multiplied by conversion factor if sold by carton)
        const stockDeduction = item.quantity * item.conversionFactor;
        updateStock.run(stockDeduction, item.productId);

        insertMovement.run(
          item.productId,
          -stockDeduction,
          saleId,
          `فاتورة مبيعات ${invoiceNumber}`,
          req.user.id
        );
      }

      // 5. If credit payment, update customer's balance
      if (customerId && remaining > 0) {
        db.prepare(`
          UPDATE customers SET balance = balance + ? WHERE id = ?
        `).run(remaining, customerId);
      }

      // 6. Audit Log
      logAudit(
        req.user.id,
        req.user.username,
        'SALE_CREATED',
        `إنشاء فاتورة ${invoiceNumber} بإجمالي ${grandTotal.toFixed(2)} ج.م (طريقة الدفع: ${paymentMethod})`,
        req.ip
      );

      // Return full receipt object
      const fullSale = db.prepare(`
        SELECT s.*, u.full_name as cashier_name, c.name as customer_name, c.phone as customer_phone
        FROM sales s
        JOIN users u ON s.cashier_id = u.id
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.id = ?
      `).get(saleId);

      const itemsInDb = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId);
      fullSale.items = itemsInDb;

      return fullSale;
    });

    const result = saleTransaction();
    res.json({
      success: true,
      message: 'تمت عملية البيع وحفظ الفاتورة بنجاح',
      sale: result
    });
  } catch (error) {
    console.error('POS Checkout error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء معالجة الفاتورة' });
  }
});

// POST /api/pos/hold - Hold current sale
router.post('/hold', authenticateToken, (req, res) => {
  const { reference, items, customerId, subtotal, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'لا يمكن تعليق فاتورة فارغة' });
  }

  const ref = reference || `معلقة-${Date.now().toString().slice(-4)}`;

  const stmt = db.prepare(`
    INSERT INTO held_sales (hold_reference, cashier_id, customer_id, items_json, subtotal, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(ref, req.user.id, customerId || null, JSON.stringify(items), subtotal || 0, notes || '');

  logAudit(req.user.id, req.user.username, 'SALE_HOLD', `تعليق فاتورة برقم إشارة: ${ref}`, req.ip);

  res.json({ success: true, holdId: result.lastInsertRowid, reference: ref });
});

// GET /api/pos/held - List held sales
router.get('/held', authenticateToken, (req, res) => {
  const heldSales = db.prepare(`
    SELECT h.*, u.full_name as cashier_name, c.name as customer_name
    FROM held_sales h
    LEFT JOIN users u ON h.cashier_id = u.id
    LEFT JOIN customers c ON h.customer_id = c.id
    ORDER BY h.id DESC
  `).all();

  heldSales.forEach(h => {
    try {
      h.items = JSON.parse(h.items_json);
    } catch (e) {
      h.items = [];
    }
  });

  res.json(heldSales);
});

// POST /api/pos/resume/:id - Resume held sale and delete from held table
router.post('/resume/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const held = db.prepare('SELECT * FROM held_sales WHERE id = ?').get(id);

  if (!held) {
    return res.status(404).json({ error: 'الفاتورة المعلقة غير موجودة' });
  }

  // Delete from held
  db.prepare('DELETE FROM held_sales WHERE id = ?').run(id);

  let items = [];
  try {
    items = JSON.parse(held.items_json);
  } catch (e) {
    items = [];
  }

  res.json({
    success: true,
    heldSale: {
      id: held.id,
      reference: held.hold_reference,
      customerId: held.customer_id,
      notes: held.notes,
      items
    }
  });
});

// DELETE /api/pos/held/:id - Cancel held sale
router.delete('/held/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.prepare('DELETE FROM held_sales WHERE id = ?').run(id);
  res.json({ success: true, message: 'تم إلغاء الفاتورة المعلقة' });
});

module.exports = router;
