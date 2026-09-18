const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');

// GET /api/settings - Get settings map
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await db.prepare('SELECT key, value, description FROM settings').all();
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });
    res.json({ settings, list: rows });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'خطأ في جلب الإعدادات' });
  }
});

// POST /api/settings - Update settings
router.post('/', authenticateToken, requirePermission('manage_settings'), async (req, res) => {
  try {
    const settingsObj = req.body;

    await db.transaction(async (tx) => {
      const stmt = tx.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value');
      for (const [key, val] of Object.entries(settingsObj)) {
        await stmt.run(key, String(val));
      }
      logAudit(req.user.id, req.user.username, 'SETTINGS_UPDATED', 'تحديث إعدادات النظام والمتجر', req.ip);
    });

    res.json({ success: true, message: 'تم حفظ الإعدادات بنجاح' });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'خطأ في حفظ الإعدادات' });
  }
});

// GET /api/settings/backup - Export complete database JSON backup
router.get('/backup', authenticateToken, requirePermission('backup_restore'), async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: 'PostgreSQL',
      tables: {
        settings: await db.prepare('SELECT * FROM settings').all(),
        roles: await db.prepare('SELECT * FROM roles').all(),
        users: await db.prepare('SELECT id, username, password_hash, full_name, role_id, phone, is_active, custom_permissions, created_at FROM users').all(),
        categories: await db.prepare('SELECT * FROM categories').all(),
        brands: await db.prepare('SELECT * FROM brands').all(),
        units: await db.prepare('SELECT * FROM units').all(),
        suppliers: await db.prepare('SELECT * FROM suppliers').all(),
        customers: await db.prepare('SELECT * FROM customers').all(),
        products: await db.prepare('SELECT * FROM products').all(),
        product_units: await db.prepare('SELECT * FROM product_units').all(),
        shifts: await db.prepare('SELECT * FROM shifts').all(),
        cash_transactions: await db.prepare('SELECT * FROM cash_transactions').all(),
        sales: await db.prepare('SELECT * FROM sales').all(),
        sale_items: await db.prepare('SELECT * FROM sale_items').all(),
        returns: await db.prepare('SELECT * FROM returns').all(),
        return_items: await db.prepare('SELECT * FROM return_items').all(),
        purchases: await db.prepare('SELECT * FROM purchases').all(),
        purchase_items: await db.prepare('SELECT * FROM purchase_items').all(),
        expenses: await db.prepare('SELECT * FROM expenses').all(),
        inventory_movements: await db.prepare('SELECT * FROM inventory_movements').all(),
        audit_logs: await db.prepare('SELECT * FROM audit_logs').all()
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
router.post('/restore', authenticateToken, requirePermission('backup_restore'), async (req, res) => {
  const backupData = req.body;

  if (!backupData || !backupData.tables) {
    return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح أو تالف' });
  }

  try {
    await db.transaction(async (tx) => {
      const { tables } = backupData;

      if (tables.settings) {
        const stmt = tx.prepare('INSERT INTO settings (key, value, description) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description');
        for (const s of tables.settings) {
          await stmt.run(s.key, s.value, s.description || '');
        }
      }

      if (tables.categories) {
        await tx.prepare('DELETE FROM categories').run();
        const stmt = tx.prepare('INSERT INTO categories (id, name, code, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)');
        for (const c of tables.categories) {
          await stmt.run(c.id, c.name, c.code, c.icon, c.sort_order, c.is_active);
        }
        await tx.query("SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE(MAX(id), 1)) FROM categories");
      }

      if (tables.suppliers) {
        await tx.prepare('DELETE FROM suppliers').run();
        const stmt = tx.prepare('INSERT INTO suppliers (id, name, company, phone, address, tax_number, opening_balance, current_balance, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        for (const s of tables.suppliers) {
          await stmt.run(s.id, s.name, s.company, s.phone, s.address, s.tax_number, s.opening_balance, s.current_balance, s.notes);
        }
        await tx.query("SELECT setval(pg_get_serial_sequence('suppliers', 'id'), COALESCE(MAX(id), 1)) FROM suppliers");
      }

      if (tables.customers) {
        await tx.prepare('DELETE FROM customers').run();
        const stmt = tx.prepare('INSERT INTO customers (id, name, phone, address, balance, credit_limit, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const c of tables.customers) {
          await stmt.run(c.id, c.name, c.phone, c.address, c.balance, c.credit_limit, c.notes);
        }
        await tx.query("SELECT setval(pg_get_serial_sequence('customers', 'id'), COALESCE(MAX(id), 1)) FROM customers");
      }

      if (tables.products) {
        await tx.prepare('DELETE FROM product_units').run();
        await tx.prepare('DELETE FROM products').run();
        const stmt = tx.prepare(`
          INSERT INTO products (
            id, barcode, sku, name, category_id, brand_id, unit, purchase_price,
            selling_price, wholesale_price, min_price, tax_percent, stock_quantity,
            min_stock_alert, expiry_date, supplier_id, is_weight, notes, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of tables.products) {
          await stmt.run(
            p.id, p.barcode, p.sku, p.name, p.category_id, p.brand_id, p.unit, p.purchase_price,
            p.selling_price, p.wholesale_price, p.min_price, p.tax_percent, p.stock_quantity,
            p.min_stock_alert, p.expiry_date, p.supplier_id, p.is_weight, p.notes, p.is_active
          );
        }
        await tx.query("SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1)) FROM products");
      }

      logAudit(req.user.id, req.user.username, 'BACKUP_RESTORED', 'استعادة قاعدة البيانات بنجاح من نسخة احتياطية', req.ip);
    });

    res.json({ success: true, message: 'تمت استعادة البيانات بنجاح من النسخة الاحتياطية' });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: err.message || 'فشلت عملية الاستعادة' });
  }
});

module.exports = router;
