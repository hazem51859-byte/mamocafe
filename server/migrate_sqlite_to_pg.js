require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { pool, initSchema } = require('./db');

async function migrateData() {
  console.log('🔄 Starting full migration from SQLite (market.db) to PostgreSQL (market_pos)...');

  // 1. Check SQLite database file
  const sqlitePath = path.join(__dirname, 'market.db');
  if (!fs.existsSync(sqlitePath)) {
    console.log('⚠️ No SQLite market.db found. Skipping migration.');
    return;
  }

  const sqlite = new Database(sqlitePath, { readonly: true });

  // 2. Ensure PG schema is initialized
  await initSchema();

  const client = await pool.connect();

  try {
    // List of tables in dependency order
    const tables = [
      'roles',
      'users',
      'categories',
      'brands',
      'units',
      'suppliers',
      'customers',
      'products',
      'product_units',
      'shifts',
      'cash_transactions',
      'sales',
      'sale_items',
      'held_sales',
      'returns',
      'return_items',
      'purchases',
      'purchase_items',
      'supplier_payments',
      'customer_payments',
      'expenses',
      'inventory_movements',
      'audit_logs',
      'settings',
      'treasury_transactions'
    ];

    await client.query('BEGIN');

    for (const table of tables) {
      // Check if table exists in SQLite
      const tableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
      if (!tableCheck) continue;

      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
      if (!rows || rows.length === 0) continue;

      console.log(`📦 Migrating table ${table}: ${rows.length} records...`);

      // Clear existing PG rows if any
      await client.query(`DELETE FROM ${table}`);

      const cols = Object.keys(rows[0]);
      const colNames = cols.join(', ');
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const insertSql = `INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = cols.map(c => (row[c] === undefined ? null : row[c]));
        await client.query(insertSql, values);
      }

      // Reset sequence if table has auto-increment id
      if (cols.includes('id')) {
        try {
          await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1)) FROM ${table}`);
        } catch (e) {
          // ignore if no serial sequence
        }
      }
    }

    await client.query('COMMIT');
    console.log('🎉 Migration completed successfully! All data migrated to PostgreSQL.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
    sqlite.close();
  }
}

if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { migrateData };
