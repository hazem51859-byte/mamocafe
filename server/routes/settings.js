const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/settings - Get settings map
router.get('/', authenticateToken, (req, res) => {
  const rows = db.prepare('SELECT key, value, description FROM settings').all();
  const settings = {};
  rows.forEach(r => {
    settings[r.key] = r.value;
  });
  res.json({ settings, list: rows });
});

// POST /api/settings - Update settings
router.post('/', authenticateToken, requirePermission('manage_settings'), (req, res) => {
  const settingsObj = req.body;

  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const updateTx = db.transaction(() => {
    for (const [key, val] of Object.entries(settingsObj)) {
      stmt.run(key, String(val));
    }
    logAudit(req.user.id, req.user.username, 'SETTINGS_UPDATED', 'تحديث إعدادات النظام والمتجر', req.ip);
  });

  updateTx();
  res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
});

// GET /api/settings/backup - Export complete database JSON backup
router.get('/backup', authenticateToken, requirePermission('backup_restore'), (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: {
        settings: db.prepare('SELECT * FROM settings').all(),
        roles: db.prepare('SELECT * FROM roles').all(),
        users: db.prepare('SELECT id, username, password_hash, full_name, role_id, phone, is_active, custom_permissions, created_at FROM users').all(),
        categories: db.prepare('SELECT * FROM categories').all(),
        brands: db.prepare('SELECT * FROM brands').all(),
        units: db.prepare('SELECT * FROM units').all(),
        suppliers: db.prepare('SELECT * FROM suppliers').all(),
        customers: db.prepare('SELECT * FROM customers').all(),
        products: db.prepare('SELECT * FROM products').all(),
        product_units: db.prepare('SELECT * FROM product_units').all(),
        shifts: db.prepare('SELECT * FROM shifts').all(),
        cash_transactions: db.prepare('SELECT * FROM cash_transactions').all(),
        sales: db.prepare('SELECT * FROM sales').all(),
        sale_items: db.prepare('SELECT * FROM sale_items').all(),
        returns: db.prepare('SELECT * FROM returns').all(),
        return_items: db.prepare('SELECT * FROM return_items').all(),
        purchases: db.prepare('SELECT * FROM purchases').all(),
        purchase_items: db.prepare('SELECT * FROM purchase_items').all(),
        expenses: db.prepare('SELECT * FROM expenses').all(),
        inventory_movements: db.prepare('SELECT * FROM inventory_movements').all(),
        audit_logs: db.prepare('SELECT * FROM audit_logs').all()
      }
    };

    logAudit(req.user.id, req.user.username, 'BACKUP_EXPORTED', 'تصدير نسخة احتياطية كاملة من النظام', req.ip);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=zotech_market_backup_${new Date().toISOString().slice(0, 10)}.json`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تصدير النسخة الاحتياطية' });
  }
});

// POST /api/settings/restore - Restore from JSON backup
router.post('/restore', authenticateToken, requirePermission('backup_restore'), (req, res) => {
  const backupData = req.body;

  if (!backupData || !backupData.tables) {
    return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح أو تالف' });
  }

  try {
    const restoreTx = db.transaction(() => {
      const { tables } = backupData;

      if (tables.settings) {
        const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)');
        tables.settings.forEach(s => stmt.run(s.key, s.value, s.description || ''));
      }

      if (tables.categories) {
        db.prepare('DELETE FROM categories').run();
        const stmt = db.prepare('INSERT INTO categories (id, name, code, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)');
        tables.categories.forEach(c => stmt.run(c.id, c.name, c.code, c.icon, c.sort_order, c.is_active));
      }

      if (tables.suppliers) {
        db.prepare('DELETE FROM suppliers').run();
        const stmt = db.prepare('INSERT INTO suppliers (id, name, company, phone, address, tax_number, opening_balance, current_balance, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        tables.suppliers.forEach(s => stmt.run(s.id, s.name, s.company, s.phone, s.address, s.tax_number, s.opening_balance, s.current_balance, s.notes));
      }

      if (tables.customers) {
        db.prepare('DELETE FROM customers').run();
        const stmt = db.prepare('INSERT INTO customers (id, name, phone, address, balance, credit_limit, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
        tables.customers.forEach(c => stmt.run(c.id, c.name, c.phone, c.address, c.balance, c.credit_limit, c.notes));
      }

      if (tables.products) {
        db.prepare('DELETE FROM product_units').run();
        db.prepare('DELETE FROM products').run();
        const stmt = db.prepare(`
          INSERT INTO products (
            id, barcode, sku, name, category_id, brand_id, unit, purchase_price,
            selling_price, wholesale_price, min_price, tax_percent, stock_quantity,
            min_stock_alert, expiry_date, supplier_id, is_weight, notes, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        tables.products.forEach(p => stmt.run(
          p.id, p.barcode, p.sku, p.name, p.category_id, p.brand_id, p.unit, p.purchase_price,
          p.selling_price, p.wholesale_price, p.min_price, p.tax_percent, p.stock_quantity,
          p.min_stock_alert, p.expiry_date, p.supplier_id, p.is_weight, p.notes, p.is_active
        ));
      }

      logAudit(req.user.id, req.user.username, 'BACKUP_RESTORED', 'استعادة قاعدة البيانات بنجاح من نسخة احتياطية', req.ip);
    });

    restoreTx();
    res.json({ success: true, message: 'تمت استعادة البيانات بنجاح من النسخة الاحتياطية' });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: err.message || 'فشلت عملية الاستعادة' });
  }
});

module.exports = router;
