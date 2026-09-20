const bcrypt = require('bcryptjs');
const { db } = require('./db');
const catalog = require('./data/egyptian_catalog');

async function seedBase() {
  console.log('Checking base seed status...');

  // Check if already seeded with users
  const userCountRes = await db.prepare('SELECT COUNT(*) as count FROM users').get();
  const userCount = userCountRes ? parseInt(userCountRes.count) : 0;
  if (userCount > 0) {
    console.log('Database already has users. Skipping base user seed.');
    return;
  }

  await db.transaction(async (tx) => {
    // 1. Settings
    const insertSetting = tx.prepare('INSERT INTO settings (key, value, description) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value');
    await insertSetting.run('store_name', 'Mamo Cafe & Market', 'اسم المنشأة');
    await insertSetting.run('store_branch', 'الفرع الرئيسي', 'اسم الفرع');
    await insertSetting.run('store_phone', '01275984405', 'هاتف المتجر');
    await insertSetting.run('store_address', 'القاهرة، مصر', 'عنوان المتجر');
    await insertSetting.run('tax_number', '', 'رقم التسجيل الضريبي');
    await insertSetting.run('commercial_register', '', 'رقم السجل التجاري');
    await insertSetting.run('tax_percentage', '0', 'نسبة ضريبة القيمة المضافة %');
    await insertSetting.run('currency', 'ج.م', 'العملة الرسمية');
    await insertSetting.run('receipt_header', 'أهلاً بكم في Mamo Cafe & Market', 'ترويسة الفاتورة');
    await insertSetting.run('receipt_footer', 'شكراً لزيارتكم - نتمنى لكم يوماً سعيداً', 'تذييل الفاتورة');
    await insertSetting.run('receipt_width', '80mm', 'عرض الفاتورة الافتراضي (80mm, 58mm, A4)');
    await insertSetting.run('auto_print', '1', 'الطباعة التلقائية بعد إنهاء الفاتورة');
    await insertSetting.run('invoice_prefix', 'INV-', 'بادئة رقم الفاتورة');
    await insertSetting.run('developer_brand', 'ZoTech', 'الجهة المطورة');
    await insertSetting.run('developer_whatsapp', '01275984405', 'رقم واتساب الدعم الفني');
    await insertSetting.run('drawer_balance', '0', 'رصيد الدرج الحالي');
    await insertSetting.run('safe_balance', '0', 'رصيد الخزنة الرئيسية');
    await insertSetting.run('visa_balance', '0', 'رصيد حساب الفيزا / البنك');
    await insertSetting.run('instapay_balance', '0', 'رصيد انستا باي');
    await insertSetting.run('main_safe_opening_balance', '0', 'الرصيد الافتتاحي للخزنة الرئيسية');
    await insertSetting.run('visa_opening_balance', '0', 'الرصيد الافتتاحي للفيزا');
    await insertSetting.run('instapay_opening_balance', '0', 'الرصيد الافتتاحي لانستا باي');
    await insertSetting.run('default_opening_cash', '0', 'الرصيد الافتتاحي الافتراضي للدرج');

    // 2. Roles
    const insertRole = tx.prepare('INSERT INTO roles (name, display_name, permissions) VALUES (?, ?, ?)');
    
    const allPermissions = [
      'view_dashboard',
      'pos_checkout',
      'pos_hold_invoice',
      'pos_change_price',
      'pos_apply_discount',
      'view_products',
      'manage_products',
      'print_barcodes',
      'view_inventory',
      'manage_inventory',
      'stock_adjustments',
      'view_sales',
      'manage_sales',
      'sales_returns',
      'view_purchases',
      'manage_purchases',
      'view_suppliers',
      'manage_suppliers',
      'view_customers',
      'manage_customers',
      'view_expenses',
      'manage_expenses',
      'cash_register_manage',
      'shifts_manage',
      'view_reports',
      'export_reports',
      'manage_users',
      'manage_settings',
      'view_audit_logs',
      'backup_restore'
    ];

    const cashierPerms = [
      'view_dashboard',
      'pos_checkout',
      'pos_hold_invoice',
      'pos_apply_discount',
      'view_products',
      'view_sales',
      'sales_returns',
      'view_customers',
      'shifts_manage'
    ];

    const managerPerms = allPermissions.filter(p => p !== 'manage_users' && p !== 'backup_restore');
    const accountantPerms = ['view_dashboard', 'view_sales', 'view_purchases', 'manage_purchases', 'view_suppliers', 'manage_suppliers', 'view_customers', 'manage_customers', 'view_expenses', 'manage_expenses', 'shifts_manage', 'view_reports', 'export_reports'];
    const inventoryPerms = ['view_dashboard', 'view_products', 'manage_products', 'print_barcodes', 'view_inventory', 'manage_inventory', 'stock_adjustments'];

    await insertRole.run('super_admin', 'المدير العام (Super Admin)', JSON.stringify(allPermissions));
    await insertRole.run('admin', 'مسؤول النظام (Admin)', JSON.stringify(allPermissions));
    await insertRole.run('manager', 'مدير الفرع (Manager)', JSON.stringify(managerPerms));
    await insertRole.run('cashier', 'كاشير (Cashier)', JSON.stringify(cashierPerms));
    await insertRole.run('inventory', 'أمين المخزن (Inventory)', JSON.stringify(inventoryPerms));
    await insertRole.run('accountant', 'محاسب مالي (Accountant)', JSON.stringify(accountantPerms));

    // 3. Primary Admin User Only
    const insertUser = tx.prepare('INSERT INTO users (username, password_hash, full_name, role_id, phone, is_active) VALUES (?, ?, ?, ?, ?, ?)');
    const salt = bcrypt.genSaltSync(10);
    const hashAdmin = bcrypt.hashSync('admin123', salt);

    await insertUser.run('admin', hashAdmin, 'م. حازم منتصر (المدير العام)', 1, '01275984405', 1);

    // 4. Default Units
    const insertUnit = tx.prepare('INSERT INTO units (name, symbol) VALUES (?, ?)');
    const defaultUnits = [
      ['قطعة', 'قطعة'],
      ['علبة', 'علبة'],
      ['كرتونة', 'كرتونة'],
      ['باكت', 'باكت'],
      ['كيس', 'كيس'],
      ['زجاجة', 'زجاجة'],
      ['برطمان', 'برطمان'],
      ['كيلوجرام', 'كجم'],
      ['جرام', 'جم'],
      ['لتر', 'لتر'],
      ['كوب', 'كوب']
    ];
    for (const [name, sym] of defaultUnits) {
      await insertUnit.run(name, sym);
    }
  });

  console.log('✅ Base roles, admin user, units and settings seeded successfully!');
}

async function seedEgyptianProducts(force = false) {
  const prodCountRes = await db.prepare('SELECT COUNT(*) as count FROM products').get();
  const prodCount = prodCountRes ? parseInt(prodCountRes.count) : 0;
  if (!force && prodCount >= catalog.products.length) {
    console.log(`Database already has ${prodCount} products. Skipping product catalog seed.`);
    return { skipped: true, total: prodCount };
  }

  console.log(`📦 Seeding/Syncing Egyptian supermarket catalog (${catalog.products.length} items)...`);

  let insertedCount = 0;

  await db.transaction(async (tx) => {
    // 1. Categories (Safe upsert)
    const catMap = new Map();
    for (const cat of catalog.categories) {
      let catRow = await tx.prepare('SELECT id FROM categories WHERE name = ?').get(cat.name);
      if (!catRow) {
        await tx.prepare('INSERT INTO categories (name, code, icon, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT (name) DO NOTHING').run(cat.name, cat.code, cat.icon, cat.sort_order);
        catRow = await tx.prepare('SELECT id FROM categories WHERE name = ?').get(cat.name);
      }
      if (catRow) {
        catMap.set(cat.name, parseInt(catRow.id));
      }
    }

    // 2. Brands (Safe upsert)
    const brandMap = new Map();
    for (const b of catalog.brands) {
      let brandRow = await tx.prepare('SELECT id FROM brands WHERE name = ?').get(b);
      if (!brandRow) {
        await tx.prepare('INSERT INTO brands (name) VALUES (?) ON CONFLICT (name) DO NOTHING').run(b);
        brandRow = await tx.prepare('SELECT id FROM brands WHERE name = ?').get(b);
      }
      if (brandRow) {
        brandMap.set(b, parseInt(brandRow.id));
      }
    }

    // 3. Products (Safe upsert by barcode)
    for (const item of catalog.products) {
      const categoryId = catMap.get(item.category) || null;
      const brandId = (item.brand && brandMap.get(item.brand)) || null;

      const existingProd = await tx.prepare('SELECT id FROM products WHERE barcode = ?').get(item.barcode);
      let prodId;

      if (!existingProd) {
        const res = await tx.prepare(`
          INSERT INTO products (
            barcode, name, category_id, brand_id, unit, purchase_price, selling_price,
            wholesale_price, min_price, stock_quantity, min_stock_alert, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          item.barcode,
          item.name,
          categoryId,
          brandId,
          item.unit || 'قطعة',
          item.purchase_price || 0,
          item.selling_price || 0,
          item.wholesale_price || item.selling_price,
          item.min_price || item.selling_price,
          0,
          item.min_stock_alert || 5,
          1
        );
        prodId = res.lastInsertRowid;
        insertedCount++;
      } else {
        prodId = existingProd.id;
      }

      // 4. Product Units
      if (item.units && Array.isArray(item.units) && prodId) {
        for (const u of item.units) {
          const unitCheck = await tx.prepare('SELECT id FROM product_units WHERE product_id = ? AND unit_name = ?').get(prodId, u.unit_name);
          if (!unitCheck) {
            await tx.prepare(`
              INSERT INTO product_units (product_id, unit_name, conversion_factor, selling_price, barcode)
              VALUES (?, ?, ?, ?, ?)
            `).run(prodId, u.unit_name, u.conversion_factor, u.selling_price, u.barcode || null);
          }
        }
      }
    }
  });

  const finalCountRes = await db.prepare('SELECT COUNT(*) as count FROM products').get();
  const finalCount = finalCountRes ? parseInt(finalCountRes.count) : 0;
  console.log(`✅ Egyptian catalog seed finished: inserted ${insertedCount} new products. Total products in DB: ${finalCount}`);
  return { success: true, inserted: insertedCount, total: finalCount };
}

async function seedDatabase() {
  await seedBase();
  await seedEgyptianProducts();
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seed finished successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase, seedBase, seedEgyptianProducts };
