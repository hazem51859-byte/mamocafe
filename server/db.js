require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL || 'postgresql://postgres:Zoma.54559@localhost:5432/market_pos';

const isRemoteDb = Boolean(
  connectionString &&
  !connectionString.includes('localhost') &&
  !connectionString.includes('127.0.0.1')
);

const pool = new Pool({
  connectionString,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/**
 * Transforms SQLite ? parameter placeholders into PostgreSQL $1, $2, $3...
 * and handles SQLite-specific keywords like INSERT OR REPLACE / INSERT OR IGNORE
 */
function formatSql(sql) {
  let paramIdx = 0;
  let formatted = sql.replace(/\?/g, () => `$${++paramIdx}`);

  // Transform INSERT OR REPLACE INTO settings ... -> INSERT INTO settings ... ON CONFLICT (key) DO UPDATE
  if (/^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+settings\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i.test(formatted)) {
    formatted = formatted.replace(
      /^\s*INSERT\s+OR\s+REPLACE\s+INTO\s+settings/i,
      'INSERT INTO settings'
    );
    formatted += ' ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = COALESCE(EXCLUDED.description, settings.description)';
  } else if (/^\s*INSERT\s+OR\s+IGNORE\s+INTO\s+settings/i.test(formatted)) {
    formatted = formatted.replace(
      /^\s*INSERT\s+OR\s+IGNORE\s+INTO\s+settings/i,
      'INSERT INTO settings'
    );
    formatted += ' ON CONFLICT (key) DO NOTHING';
  }

  return formatted;
}

/**
 * Clean parameters: sanitize undefined to null, flatten array if passed
 */
function sanitizeParams(params) {
  if (!params) return [];
  const list = Array.isArray(params) ? params : [params];
  return list.map(p => (p === undefined ? null : p));
}

// Global db helper object
const db = {
  pool,

  async query(sql, params = []) {
    const formatted = formatSql(sql);
    const cleanParams = sanitizeParams(params);
    return await pool.query(formatted, cleanParams);
  },

  async get(sql, params = []) {
    const res = await this.query(sql, params);
    return res.rows[0];
  },

  async all(sql, params = []) {
    const res = await this.query(sql, params);
    return res.rows;
  },

  async run(sql, params = []) {
    let formatted = formatSql(sql);
    const isInsert = /^\s*INSERT\s+INTO/i.test(formatted);
    if (isInsert && !/RETURNING/i.test(formatted) && !/INSERT\s+INTO\s+settings/i.test(formatted)) {
      formatted += ' RETURNING id';
    }
    const cleanParams = sanitizeParams(params);
    const res = await pool.query(formatted, cleanParams);
    const lastInsertRowid = (res.rows && res.rows[0] && res.rows[0].id) ? parseInt(res.rows[0].id) : null;
    return {
      lastInsertRowid,
      changes: res.rowCount,
      rows: res.rows
    };
  },

  /**
   * Prepares a statement-like object compatible with better-sqlite3 API
   * Usage: await db.prepare(sql).get(...params)
   *        await db.prepare(sql).all(...params)
   *        await db.prepare(sql).run(...params)
   */
  prepare(sql) {
    const self = this;
    return {
      get: async (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return await self.get(sql, params);
      },
      all: async (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return await self.all(sql, params);
      },
      run: async (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return await self.run(sql, params);
      }
    };
  },

  /**
   * Database Transaction Runner for PostgreSQL
   * Usage:
   * await db.transaction(async (tx) => {
   *   const r = await tx.prepare('INSERT ...').run(...);
   *   await tx.prepare('UPDATE ...').run(...);
   * });
   */
  async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const tx = {
        async query(sql, params = []) {
          const formatted = formatSql(sql);
          const cleanParams = sanitizeParams(params);
          return await client.query(formatted, cleanParams);
        },
        async get(sql, params = []) {
          const res = await this.query(sql, params);
          return res.rows[0];
        },
        async all(sql, params = []) {
          const res = await this.query(sql, params);
          return res.rows;
        },
        async run(sql, params = []) {
          let formatted = formatSql(sql);
          const isInsert = /^\s*INSERT\s+INTO/i.test(formatted);
          if (isInsert && !/RETURNING/i.test(formatted) && !/INSERT\s+INTO\s+settings/i.test(formatted)) {
            formatted += ' RETURNING id';
          }
          const cleanParams = sanitizeParams(params);
          const res = await client.query(formatted, cleanParams);
          const lastInsertRowid = (res.rows && res.rows[0] && res.rows[0].id) ? parseInt(res.rows[0].id) : null;
          return {
            lastInsertRowid,
            changes: res.rowCount,
            rows: res.rows
          };
        },
        prepare(sql) {
          const self = this;
          return {
            get: async (...args) => {
              const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
              return await self.get(sql, params);
            },
            all: async (...args) => {
              const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
              return await self.all(sql, params);
            },
            run: async (...args) => {
              const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
              return await self.run(sql, params);
            }
          };
        }
      };

      const result = await callback(tx);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};

async function initSchema() {
  const client = await pool.connect();
  try {
    // 1. Compatibility helper functions
    await client.query(`
      CREATE OR REPLACE FUNCTION strftime(fmt text, ts timestamp) RETURNS text AS $$
      BEGIN
        IF fmt = '%Y-%m' THEN RETURN to_char(ts, 'YYYY-MM');
        ELSIF fmt = '%Y-%m-%d' THEN RETURN to_char(ts, 'YYYY-MM-DD');
        ELSE RETURN to_char(ts, 'YYYY-MM-DD HH24:MI:SS');
        END IF;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION strftime(fmt text, val text) RETURNS text AS $$
      BEGIN
        IF val = 'now' THEN
          IF fmt = '%Y-%m' THEN RETURN to_char(CURRENT_TIMESTAMP, 'YYYY-MM');
          ELSE RETURN to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD');
          END IF;
        END IF;
        RETURN val;
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION date(val text, modifier text) RETURNS text AS $$
      BEGIN
        IF val = 'now' AND modifier = '-1 day' THEN
          RETURN to_char(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD');
        END IF;
        RETURN to_char(CURRENT_DATE, 'YYYY-MM-DD');
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    // 2. Schema tables
    await client.query(`
      -- 1. Roles & Permissions
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        permissions TEXT NOT NULL
      );

      -- 2. Users
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role_id INTEGER NOT NULL REFERENCES roles(id),
        phone TEXT,
        is_active INTEGER DEFAULT 1,
        custom_permissions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 3. Categories
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        code TEXT,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      );

      -- 4. Brands
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      -- 5. Units
      CREATE TABLE IF NOT EXISTS units (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        symbol TEXT
      );

      -- 6. Suppliers
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT,
        phone TEXT,
        address TEXT,
        tax_number TEXT,
        opening_balance NUMERIC(15, 2) DEFAULT 0,
        current_balance NUMERIC(15, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 7. Customers
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        balance NUMERIC(15, 2) DEFAULT 0,
        credit_limit NUMERIC(15, 2) DEFAULT 5000,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 8. Products
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        barcode TEXT UNIQUE NOT NULL,
        sku TEXT,
        name TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        brand_id INTEGER REFERENCES brands(id),
        unit TEXT DEFAULT 'قطعة',
        purchase_price NUMERIC(15, 2) NOT NULL,
        selling_price NUMERIC(15, 2) NOT NULL,
        wholesale_price NUMERIC(15, 2),
        min_price NUMERIC(15, 2),
        tax_percent NUMERIC(5, 2) DEFAULT 0,
        stock_quantity NUMERIC(15, 3) DEFAULT 0,
        min_stock_alert NUMERIC(15, 3) DEFAULT 5,
        expiry_date DATE,
        supplier_id INTEGER REFERENCES suppliers(id),
        is_weight INTEGER DEFAULT 0,
        image_url TEXT,
        notes TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 9. Product Additional Units
      CREATE TABLE IF NOT EXISTS product_units (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        unit_name TEXT NOT NULL,
        conversion_factor NUMERIC(15, 3) NOT NULL,
        selling_price NUMERIC(15, 2) NOT NULL,
        barcode TEXT
      );

      -- 10. Shifts
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        cashier_id INTEGER NOT NULL REFERENCES users(id),
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        opening_cash NUMERIC(15, 2) NOT NULL DEFAULT 0,
        closing_cash_expected NUMERIC(15, 2) DEFAULT 0,
        closing_cash_actual NUMERIC(15, 2) DEFAULT 0,
        difference NUMERIC(15, 2) DEFAULT 0,
        status TEXT DEFAULT 'open',
        notes TEXT
      );

      -- 11. Cash Register Transactions
      CREATE TABLE IF NOT EXISTS cash_transactions (
        id SERIAL PRIMARY KEY,
        shift_id INTEGER NOT NULL REFERENCES shifts(id),
        type TEXT NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 12. Sales Invoices
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        shift_id INTEGER REFERENCES shifts(id),
        cashier_id INTEGER NOT NULL REFERENCES users(id),
        customer_id INTEGER REFERENCES customers(id),
        subtotal NUMERIC(15, 2) NOT NULL,
        discount_amount NUMERIC(15, 2) DEFAULT 0,
        tax_amount NUMERIC(15, 2) DEFAULT 0,
        grand_total NUMERIC(15, 2) NOT NULL,
        paid_amount NUMERIC(15, 2) NOT NULL,
        change_amount NUMERIC(15, 2) DEFAULT 0,
        remaining_amount NUMERIC(15, 2) DEFAULT 0,
        payment_method TEXT DEFAULT 'cash',
        payment_details TEXT,
        status TEXT DEFAULT 'completed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 13. Sale Items
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name TEXT NOT NULL,
        barcode TEXT,
        unit TEXT,
        quantity NUMERIC(15, 3) NOT NULL,
        unit_price NUMERIC(15, 2) NOT NULL,
        purchase_price NUMERIC(15, 2) NOT NULL,
        discount_percent NUMERIC(5, 2) DEFAULT 0,
        discount_amount NUMERIC(15, 2) DEFAULT 0,
        tax_amount NUMERIC(15, 2) DEFAULT 0,
        total NUMERIC(15, 2) NOT NULL
      );

      -- 14. Held Sales
      CREATE TABLE IF NOT EXISTS held_sales (
        id SERIAL PRIMARY KEY,
        hold_reference TEXT NOT NULL,
        cashier_id INTEGER REFERENCES users(id),
        customer_id INTEGER REFERENCES customers(id),
        items_json TEXT NOT NULL,
        subtotal NUMERIC(15, 2) DEFAULT 0,
        discount_amount NUMERIC(15, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 15. Sales Returns
      CREATE TABLE IF NOT EXISTS returns (
        id SERIAL PRIMARY KEY,
        return_number TEXT UNIQUE NOT NULL,
        sale_id INTEGER REFERENCES sales(id),
        invoice_number TEXT,
        shift_id INTEGER REFERENCES shifts(id),
        cashier_id INTEGER NOT NULL REFERENCES users(id),
        customer_id INTEGER REFERENCES customers(id),
        total_refund NUMERIC(15, 2) NOT NULL,
        refund_method TEXT DEFAULT 'cash',
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 16. Return Items
      CREATE TABLE IF NOT EXISTS return_items (
        id SERIAL PRIMARY KEY,
        return_id INTEGER NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name TEXT NOT NULL,
        quantity NUMERIC(15, 3) NOT NULL,
        unit_price NUMERIC(15, 2) NOT NULL,
        total NUMERIC(15, 2) NOT NULL
      );

      -- 17. Purchases Invoices
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        invoice_date DATE DEFAULT CURRENT_DATE,
        subtotal NUMERIC(15, 2) NOT NULL,
        discount_amount NUMERIC(15, 2) DEFAULT 0,
        tax_amount NUMERIC(15, 2) DEFAULT 0,
        grand_total NUMERIC(15, 2) NOT NULL,
        paid_amount NUMERIC(15, 2) DEFAULT 0,
        remaining_amount NUMERIC(15, 2) DEFAULT 0,
        payment_status TEXT DEFAULT 'paid',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 18. Purchase Items
      CREATE TABLE IF NOT EXISTS purchase_items (
        id SERIAL PRIMARY KEY,
        purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        product_name TEXT NOT NULL,
        quantity NUMERIC(15, 3) NOT NULL,
        purchase_price NUMERIC(15, 2) NOT NULL,
        total NUMERIC(15, 2) NOT NULL
      );

      -- 19. Supplier Payments
      CREATE TABLE IF NOT EXISTS supplier_payments (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
        amount NUMERIC(15, 2) NOT NULL,
        payment_date DATE DEFAULT CURRENT_DATE,
        payment_method TEXT DEFAULT 'cash',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 20. Customer Payments
      CREATE TABLE IF NOT EXISTS customer_payments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        amount NUMERIC(15, 2) NOT NULL,
        payment_date DATE DEFAULT CURRENT_DATE,
        payment_method TEXT DEFAULT 'cash',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 21. Expenses
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        expense_date DATE DEFAULT CURRENT_DATE,
        shift_id INTEGER REFERENCES shifts(id),
        employee_name TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 22. Inventory Movements
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        movement_type TEXT NOT NULL,
        quantity NUMERIC(15, 3) NOT NULL,
        reference_type TEXT,
        reference_id INTEGER,
        notes TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 23. Audit Logs
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        username TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 24. Settings
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT
      );

      -- 25. Treasury Transactions
      CREATE TABLE IF NOT EXISTS treasury_transactions (
        id SERIAL PRIMARY KEY,
        account TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC(15, 2) NOT NULL,
        related_account TEXT,
        shift_id INTEGER REFERENCES shifts(id),
        user_id INTEGER REFERENCES users(id),
        reason TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
      CREATE INDEX IF NOT EXISTS idx_sales_shift ON sales(shift_id);
      CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
      CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_cashier ON shifts(cashier_id);
      CREATE INDEX IF NOT EXISTS idx_treasury_account ON treasury_transactions(account);
      CREATE INDEX IF NOT EXISTS idx_treasury_created ON treasury_transactions(created_at);
    `);

    // Insert Default Treasury Settings if not existing
    await client.query(`
      INSERT INTO settings (key, value, description)
      VALUES
        ('default_opening_cash', '1000', 'عهدة الدرج الافتتاحية الإجبارية للكاشير'),
        ('main_safe_opening_balance', '15000', 'الرصيد الافتتاحي للخزنة الرئيسية'),
        ('visa_opening_balance', '0', 'رصيد الفيزا الافتتاحي'),
        ('instapay_opening_balance', '0', 'رصيد إنستا باي الافتتاحي')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('✅ PostgreSQL Schema initialized successfully in database: market_pos');
  } catch (err) {
    console.error('❌ Error initializing PostgreSQL schema:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { db, pool, initSchema };
