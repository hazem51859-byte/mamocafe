const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// GET /api/reports/dashboard - Master dashboard metrics
router.get('/dashboard', authenticateToken, (req, res) => {
  // Today's stats
  const today = db.prepare(`
    SELECT
      COUNT(id) as invoices_count,
      COALESCE(SUM(grand_total), 0) as sales_total,
      COALESCE(SUM(discount_amount), 0) as discounts_total
    FROM sales
    WHERE date(created_at) = date('now') AND status = 'completed'
  `).get();

  // Yesterday's stats
  const yesterday = db.prepare(`
    SELECT
      COUNT(id) as invoices_count,
      COALESCE(SUM(grand_total), 0) as sales_total
    FROM sales
    WHERE date(created_at) = date('now', '-1 day') AND status = 'completed'
  `).get();

  // This month's stats
  const thisMonth = db.prepare(`
    SELECT
      COUNT(id) as invoices_count,
      COALESCE(SUM(grand_total), 0) as sales_total
    FROM sales
    WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status = 'completed'
  `).get();

  // Gross profit today (Sales items total - purchase cost)
  const todayProfit = db.prepare(`
    SELECT
      COALESCE(SUM(si.total - (si.quantity * si.purchase_price)), 0) as gross_profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE date(s.created_at) = date('now') AND s.status = 'completed'
  `).get().gross_profit;

  // Expenses today
  const todayExpenses = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date(expense_date) = date('now')
  `).get().total;

  // Purchases today
  const todayPurchases = db.prepare(`
    SELECT COALESCE(SUM(grand_total), 0) as total FROM purchases WHERE date(invoice_date) = date('now')
  `).get().total;

  // Active shift cash
  const activeShift = db.prepare(`
    SELECT * FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1
  `).get();

  let cashInDrawer = 0;
  if (activeShift) {
    const cashSales = db.prepare(`
      SELECT COALESCE(SUM(paid_amount), 0) as cash_sum
      FROM sales
      WHERE shift_id = ? AND payment_method = 'cash' AND status = 'completed'
    `).get(activeShift.id).cash_sum;

    const shiftExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as exp_sum FROM expenses WHERE shift_id = ?
    `).get(activeShift.id).exp_sum;

    cashInDrawer = activeShift.opening_cash + cashSales - shiftExpenses;
  }

  // Inventory numbers
  const inventoryMetrics = db.prepare(`
    SELECT
      COUNT(id) as total_products,
      SUM(CASE WHEN stock_quantity <= min_stock_alert THEN 1 ELSE 0 END) as low_stock_count,
      SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date <= date('now') THEN 1 ELSE 0 END) as expired_count
    FROM products
    WHERE is_active = 1
  `).get();

  // Customer debts & collected
  const debts = db.prepare(`
    SELECT
      COALESCE(SUM(balance), 0) as total_customer_debts
    FROM customers
    WHERE balance > 0
  `).get();

  const collectedDebtsToday = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as collected_today
    FROM customer_payments
    WHERE date(payment_date) = date('now')
  `).get().collected_today;

  // Supplier debts
  const supplierDebts = db.prepare(`
    SELECT COALESCE(SUM(current_balance), 0) as total_supplier_debts FROM suppliers
  `).get().total_supplier_debts;

  // Recent 8 sales
  const recentSales = db.prepare(`
    SELECT s.id, s.invoice_number, s.grand_total, s.payment_method, s.created_at,
           u.full_name as cashier_name, c.name as customer_name
    FROM sales s
    JOIN users u ON s.cashier_id = u.id
    LEFT JOIN customers c ON s.customer_id = c.id
    WHERE s.status = 'completed'
    ORDER BY s.id DESC
    LIMIT 8
  `).all();

  // Last 7 days sales trend
  const salesTrend = db.prepare(`
    SELECT date(created_at) as day_date,
           COUNT(id) as invoices_count,
           COALESCE(SUM(grand_total), 0) as total_sales
    FROM sales
    WHERE created_at >= date('now', '-6 days') AND status = 'completed'
    GROUP BY date(created_at)
    ORDER BY day_date ASC
  `).all();

  res.json({
    metrics: {
      todaySales: today.sales_total,
      todayInvoices: today.invoices_count,
      yesterdaySales: yesterday.sales_total,
      thisMonthSales: thisMonth.sales_total,
      grossProfit: todayProfit,
      netProfit: todayProfit - todayExpenses,
      todayPurchases,
      todayExpenses,
      cashInDrawer: Math.max(0, cashInDrawer),
      totalProducts: inventoryMetrics.total_products,
      lowStockCount: inventoryMetrics.low_stock_count,
      expiredCount: inventoryMetrics.expired_count,
      customerDebts: debts.total_customer_debts,
      collectedDebts: collectedDebtsToday,
      supplierDebts
    },
    recentSales,
    salesTrend
  });
});

// GET /api/reports/sales - Detailed sales reports
router.get('/sales', authenticateToken, requirePermission('view_reports'), (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  let dateFilter = '';
  const params = [];

  if (startDate) {
    dateFilter += ' AND date(s.created_at) >= ?';
    params.push(startDate);
  }
  if (endDate) {
    dateFilter += ' AND date(s.created_at) <= ?';
    params.push(endDate);
  }

  // Sales by Day
  const byDay = db.prepare(`
    SELECT date(s.created_at) as period,
           COUNT(s.id) as invoices_count,
           SUM(s.subtotal) as subtotal,
           SUM(s.discount_amount) as discount,
           SUM(s.tax_amount) as tax,
           SUM(s.grand_total) as grand_total
    FROM sales s
    WHERE s.status = 'completed' ${dateFilter}
    GROUP BY date(s.created_at)
    ORDER BY period DESC
  `).all(...params);

  // Sales by Cashier
  const byCashier = db.prepare(`
    SELECT u.full_name as cashier_name,
           COUNT(s.id) as invoices_count,
           SUM(s.grand_total) as total_sales
    FROM sales s
    JOIN users u ON s.cashier_id = u.id
    WHERE s.status = 'completed' ${dateFilter}
    GROUP BY u.id
    ORDER BY total_sales DESC
  `).all(...params);

  // Sales by Payment Method
  const byPaymentMethod = db.prepare(`
    SELECT s.payment_method,
           COUNT(s.id) as count,
           SUM(s.grand_total) as total
    FROM sales s
    WHERE s.status = 'completed' ${dateFilter}
    GROUP BY s.payment_method
    ORDER BY total DESC
  `).all(...params);

  // Top Selling Products
  const topProducts = db.prepare(`
    SELECT si.product_id, si.product_name, si.unit,
           SUM(si.quantity) as total_quantity,
           SUM(si.total) as total_revenue,
           SUM(si.total - (si.quantity * si.purchase_price)) as total_profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.status = 'completed' ${dateFilter}
    GROUP BY si.product_id
    ORDER BY total_revenue DESC
    LIMIT 20
  `).all(...params);

  // Sales by Category
  const byCategory = db.prepare(`
    SELECT COALESCE(c.name, 'بدون تصنيف') as category_name,
           COUNT(DISTINCT s.id) as invoices_count,
           SUM(si.total) as total_revenue
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN products p ON si.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE s.status = 'completed' ${dateFilter}
    GROUP BY c.id
    ORDER BY total_revenue DESC
  `).all(...params);

  res.json({
    byDay,
    byCashier,
    byPaymentMethod,
    topProducts,
    byCategory
  });
});

// GET /api/reports/profits - Detailed profit reports
router.get('/profits', authenticateToken, requirePermission('view_reports'), (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = '';
  let expDateFilter = '';
  const params = [];
  const expParams = [];

  if (startDate) {
    dateFilter += ' AND date(s.created_at) >= ?';
    expDateFilter += ' AND date(expense_date) >= ?';
    params.push(startDate);
    expParams.push(startDate);
  }
  if (endDate) {
    dateFilter += ' AND date(s.created_at) <= ?';
    expDateFilter += ' AND date(expense_date) <= ?';
    params.push(endDate);
    expParams.push(endDate);
  }

  // Total sales revenue and cost
  const salesAgg = db.prepare(`
    SELECT
      COALESCE(SUM(si.total), 0) as total_revenue,
      COALESCE(SUM(si.quantity * si.purchase_price), 0) as total_cogs
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.status = 'completed' ${dateFilter}
  `).get(...params);

  const grossProfit = salesAgg.total_revenue - salesAgg.total_cogs;

  // Expenses in same period
  const expensesTotal = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE 1=1 ${expDateFilter}
  `).get(...expParams).total;

  const netProfit = grossProfit - expensesTotal;
  const marginPercent = salesAgg.total_revenue > 0 ? ((grossProfit / salesAgg.total_revenue) * 100).toFixed(2) : 0;

  // Profit by Category
  const profitByCategory = db.prepare(`
    SELECT COALESCE(c.name, 'عام') as category_name,
           SUM(si.total) as revenue,
           SUM(si.quantity * si.purchase_price) as cogs,
           SUM(si.total - (si.quantity * si.purchase_price)) as profit
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    JOIN products p ON si.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE s.status = 'completed' ${dateFilter}
    GROUP BY c.id
    ORDER BY profit DESC
  `).all(...params);

  res.json({
    summary: {
      revenue: salesAgg.total_revenue,
      costOfGoods: salesAgg.total_cogs,
      grossProfit,
      expenses: expensesTotal,
      netProfit,
      marginPercent
    },
    profitByCategory
  });
});

module.exports = router;
