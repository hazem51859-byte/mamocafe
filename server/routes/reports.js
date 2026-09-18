const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

// GET /api/reports/dashboard - Master dashboard metrics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Today's stats
    const today = (await db.prepare(`
      SELECT
        COUNT(id) as invoices_count,
        COALESCE(SUM(grand_total), 0) as sales_total,
        COALESCE(SUM(discount_amount), 0) as discounts_total
      FROM sales
      WHERE date(created_at) = CURRENT_DATE AND status = 'completed'
    `).get()) || {};

    // Yesterday's stats
    const yesterday = (await db.prepare(`
      SELECT
        COUNT(id) as invoices_count,
        COALESCE(SUM(grand_total), 0) as sales_total
      FROM sales
      WHERE date(created_at) = CURRENT_DATE - INTERVAL '1 day' AND status = 'completed'
    `).get()) || {};

    // This month's stats
    const thisMonth = (await db.prepare(`
      SELECT
        COUNT(id) as invoices_count,
        COALESCE(SUM(grand_total), 0) as sales_total
      FROM sales
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status = 'completed'
    `).get()) || {};

    // Gross profit today (Sales items total - purchase cost)
    const todayProfitRes = await db.prepare(`
      SELECT
        COALESCE(SUM(si.total - (si.quantity * si.purchase_price)), 0) as gross_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE date(s.created_at) = CURRENT_DATE AND s.status = 'completed'
    `).get();
    const todayProfit = todayProfitRes ? parseFloat(todayProfitRes.gross_profit) : 0;

    // Expenses today
    const todayExpensesRes = await db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date(expense_date) = CURRENT_DATE
    `).get();
    const todayExpenses = todayExpensesRes ? parseFloat(todayExpensesRes.total) : 0;

    // Purchases today
    const todayPurchasesRes = await db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total FROM purchases WHERE date(invoice_date) = CURRENT_DATE
    `).get();
    const todayPurchases = todayPurchasesRes ? parseFloat(todayPurchasesRes.total) : 0;

    // Active shift cash
    const activeShift = await db.prepare(`
      SELECT * FROM shifts WHERE status = 'open' ORDER BY id DESC LIMIT 1
    `).get();

    let cashInDrawer = 0;
    if (activeShift) {
      const cashSalesRes = await db.prepare(`
        SELECT COALESCE(SUM(paid_amount), 0) as cash_sum
        FROM sales
        WHERE shift_id = ? AND payment_method = 'cash' AND status = 'completed'
      `).get(activeShift.id);
      const cashSales = cashSalesRes ? parseFloat(cashSalesRes.cash_sum) : 0;

      const shiftExpensesRes = await db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as exp_sum FROM expenses WHERE shift_id = ?
      `).get(activeShift.id);
      const shiftExpenses = shiftExpensesRes ? parseFloat(shiftExpensesRes.exp_sum) : 0;

      cashInDrawer = parseFloat(activeShift.opening_cash) + cashSales - shiftExpenses;
    }

    // Inventory numbers
    const inventoryMetrics = (await db.prepare(`
      SELECT
        COUNT(id) as total_products,
        SUM(CASE WHEN stock_quantity <= min_stock_alert THEN 1 ELSE 0 END) as low_stock_count,
        SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE THEN 1 ELSE 0 END) as expired_count
      FROM products
      WHERE is_active = 1
    `).get()) || {};

    // Customer debts & collected
    const debts = (await db.prepare(`
      SELECT
        COALESCE(SUM(balance), 0) as total_customer_debts
      FROM customers
      WHERE balance > 0
    `).get()) || {};

    const collectedDebtsRes = await db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as collected_today
      FROM customer_payments
      WHERE date(payment_date) = CURRENT_DATE
    `).get();
    const collectedDebtsToday = collectedDebtsRes ? parseFloat(collectedDebtsRes.collected_today) : 0;

    // Supplier debts
    const supplierDebtsRes = await db.prepare(`
      SELECT COALESCE(SUM(current_balance), 0) as total_supplier_debts FROM suppliers
    `).get();
    const supplierDebts = supplierDebtsRes ? parseFloat(supplierDebtsRes.total_supplier_debts) : 0;

    // Recent 8 sales
    const recentSales = await db.prepare(`
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
    const salesTrend = await db.prepare(`
      SELECT date(created_at) as day_date,
             COUNT(id) as invoices_count,
             COALESCE(SUM(grand_total), 0) as total_sales
      FROM sales
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days' AND status = 'completed'
      GROUP BY date(created_at)
      ORDER BY day_date ASC
    `).all();

    res.json({
      metrics: {
        todaySales: parseFloat(today.sales_total || 0),
        todayInvoices: parseInt(today.invoices_count || 0),
        yesterdaySales: parseFloat(yesterday.sales_total || 0),
        thisMonthSales: parseFloat(thisMonth.sales_total || 0),
        grossProfit: todayProfit,
        netProfit: todayProfit - todayExpenses,
        todayPurchases,
        todayExpenses,
        cashInDrawer: Math.max(0, cashInDrawer),
        totalProducts: parseInt(inventoryMetrics.total_products || 0),
        lowStockCount: parseInt(inventoryMetrics.low_stock_count || 0),
        expiredCount: parseInt(inventoryMetrics.expired_count || 0),
        customerDebts: parseFloat(debts.total_customer_debts || 0),
        collectedDebts: collectedDebtsToday,
        supplierDebts
      },
      recentSales,
      salesTrend
    });
  } catch (err) {
    console.error('Error fetching dashboard report:', err);
    res.status(500).json({ error: 'خطأ في جلب بيانات لوحة التحكم' });
  }
});

// GET /api/reports/sales - Detailed sales reports
router.get('/sales', authenticateToken, requirePermission('view_reports'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

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
    const byDay = await db.prepare(`
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
    const byCashier = await db.prepare(`
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
    const byPaymentMethod = await db.prepare(`
      SELECT s.payment_method,
             COUNT(s.id) as count,
             SUM(s.grand_total) as total
      FROM sales s
      WHERE s.status = 'completed' ${dateFilter}
      GROUP BY s.payment_method
      ORDER BY total DESC
    `).all(...params);

    // Top Selling Products
    const topProducts = await db.prepare(`
      SELECT si.product_id, si.product_name, si.unit,
             SUM(si.quantity) as total_quantity,
             SUM(si.total) as total_revenue,
             SUM(si.total - (si.quantity * si.purchase_price)) as total_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed' ${dateFilter}
      GROUP BY si.product_id, si.product_name, si.unit
      ORDER BY total_revenue DESC
      LIMIT 20
    `).all(...params);

    // Sales by Category
    const byCategory = await db.prepare(`
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
  } catch (err) {
    console.error('Error fetching sales report:', err);
    res.status(500).json({ error: 'خطأ في جلب تقرير المبيعات' });
  }
});

// GET /api/reports/profits - Detailed profit reports
router.get('/profits', authenticateToken, requirePermission('view_reports'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let expDateFilter = '';
    let purchDateFilter = '';
    let spDateFilter = '';
    let cpDateFilter = '';
    const params = [];
    const expParams = [];
    const purchParams = [];
    const spParams = [];
    const cpParams = [];

    if (startDate) {
      dateFilter += ' AND date(s.created_at) >= ?';
      expDateFilter += ' AND date(expense_date) >= ?';
      purchDateFilter += ' AND date(invoice_date) >= ?';
      spDateFilter += ' AND date(payment_date) >= ?';
      cpDateFilter += ' AND date(payment_date) >= ?';
      params.push(startDate);
      expParams.push(startDate);
      purchParams.push(startDate);
      spParams.push(startDate);
      cpParams.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND date(s.created_at) <= ?';
      expDateFilter += ' AND date(expense_date) <= ?';
      purchDateFilter += ' AND date(invoice_date) <= ?';
      spDateFilter += ' AND date(payment_date) <= ?';
      cpDateFilter += ' AND date(payment_date) <= ?';
      params.push(endDate);
      expParams.push(endDate);
      purchParams.push(endDate);
      spParams.push(endDate);
      cpParams.push(endDate);
    }

    // 1. Sales revenue and cost of goods sold
    const salesAgg = (await db.prepare(`
      SELECT
        COALESCE(SUM(si.total), 0) as total_revenue,
        COALESCE(SUM(si.quantity * si.purchase_price), 0) as total_cogs
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed' ${dateFilter}
    `).get(...params)) || {};

    const rev = parseFloat(salesAgg.total_revenue || 0);
    const cogs = parseFloat(salesAgg.total_cogs || 0);
    const grossProfit = rev - cogs;

    // 2. Expenses in period
    const expensesTotalRes = await db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE 1=1 ${expDateFilter}
    `).get(...expParams);
    const expensesTotal = expensesTotalRes ? parseFloat(expensesTotalRes.total) : 0;

    const netProfit = grossProfit - expensesTotal;
    const marginPercent = rev > 0 ? ((grossProfit / rev) * 100).toFixed(2) : 0;
    const netMarginPercent = rev > 0 ? ((netProfit / rev) * 100).toFixed(2) : 0;

    // 3. Purchases in period
    const purchasesPeriod = (await db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total, COUNT(id) as count
      FROM purchases
      WHERE 1=1 ${purchDateFilter}
    `).get(...purchParams)) || {};

    // 4. Supplier payments in period
    const supplierPaymentsRes = await db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM supplier_payments WHERE 1=1 ${spDateFilter}
    `).get(...spParams);
    const supplierPaymentsPeriod = supplierPaymentsRes ? parseFloat(supplierPaymentsRes.total) : 0;

    // 5. Customer debt payments in period
    const customerPaymentsRes = await db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM customer_payments WHERE 1=1 ${cpDateFilter}
    `).get(...cpParams);
    const customerPaymentsPeriod = customerPaymentsRes ? parseFloat(customerPaymentsRes.total) : 0;

    // 6. Overall supplier debts (accounts payable)
    const supplierDebtsAgg = (await db.prepare(`
      SELECT
        COALESCE(SUM(current_balance), 0) as total_debts,
        COUNT(CASE WHEN current_balance > 0 THEN 1 END) as creditors_count
      FROM suppliers
    `).get()) || {};

    // 7. Overall customer debts (accounts receivable)
    const customerDebtsAgg = (await db.prepare(`
      SELECT
        COALESCE(SUM(balance), 0) as total_debts,
        COUNT(CASE WHEN balance > 0 THEN 1 END) as debtors_count
      FROM customers
    `).get()) || {};

    // 8. Profit by Category
    const profitByCategory = await db.prepare(`
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

    // 9. Expenses breakdown by category
    const expensesByCategory = await db.prepare(`
      SELECT category, COUNT(id) as count, SUM(amount) as total
      FROM expenses
      WHERE 1=1 ${expDateFilter}
      GROUP BY category
      ORDER BY total DESC
    `).all(...expParams);

    // 10. Expenses detailed list
    const expensesList = await db.prepare(`
      SELECT id, category, amount, expense_date, employee_name, notes, created_at
      FROM expenses
      WHERE 1=1 ${expDateFilter}
      ORDER BY expense_date DESC, id DESC
      LIMIT 100
    `).all(...expParams);

    // 11. Detailed suppliers list with balances
    const suppliersList = await db.prepare(`
      SELECT
        s.id, s.name, s.company, s.phone, s.current_balance,
        COALESCE(p_stats.total_purchases, 0) as total_purchases,
        COALESCE(p_stats.invoices_count, 0) as invoices_count,
        COALESCE(pay_stats.total_paid, 0) as total_paid,
        p_stats.last_invoice_date
      FROM suppliers s
      LEFT JOIN (
        SELECT supplier_id, SUM(grand_total) as total_purchases, COUNT(id) as invoices_count, MAX(invoice_date) as last_invoice_date
        FROM purchases GROUP BY supplier_id
      ) p_stats ON s.id = p_stats.supplier_id
      LEFT JOIN (
        SELECT supplier_id, SUM(amount) as total_paid FROM supplier_payments GROUP BY supplier_id
      ) pay_stats ON s.id = pay_stats.supplier_id
      WHERE s.current_balance > 0
      ORDER BY s.current_balance DESC
    `).all();

    // 12. Detailed customers list with debts
    const customersList = await db.prepare(`
      SELECT
        c.id, c.name, c.phone, c.address, c.balance, c.credit_limit,
        COALESCE(s_stats.total_spent, 0) as total_spent,
        COALESCE(s_stats.invoices_count, 0) as invoices_count,
        COALESCE(pay_stats.total_paid, 0) as total_paid,
        s_stats.last_sale_date
      FROM customers c
      LEFT JOIN (
        SELECT customer_id, SUM(grand_total) as total_spent, COUNT(id) as invoices_count, MAX(date(created_at)) as last_sale_date
        FROM sales WHERE status = 'completed' GROUP BY customer_id
      ) s_stats ON c.id = s_stats.customer_id
      LEFT JOIN (
        SELECT customer_id, SUM(amount) as total_paid FROM customer_payments GROUP BY customer_id
      ) pay_stats ON c.id = pay_stats.customer_id
      WHERE c.balance > 0
      ORDER BY c.balance DESC
    `).all();

    const totCustDebts = parseFloat(customerDebtsAgg.total_debts || 0);
    const totSuppDebts = parseFloat(supplierDebtsAgg.total_debts || 0);

    res.json({
      summary: {
        revenue: rev,
        costOfGoods: cogs,
        grossProfit,
        expenses: expensesTotal,
        netProfit,
        marginPercent,
        netMarginPercent,
        totalPurchases: parseFloat(purchasesPeriod.total || 0),
        purchasesCount: parseInt(purchasesPeriod.count || 0),
        supplierPaymentsPeriod,
        customerPaymentsPeriod,
        totalSupplierDebts: totSuppDebts,
        creditorsCount: parseInt(supplierDebtsAgg.creditors_count || 0),
        totalCustomerDebts: totCustDebts,
        debtorsCount: parseInt(customerDebtsAgg.debtors_count || 0),
        financialPosition: netProfit + totCustDebts - totSuppDebts
      },
      profitByCategory,
      expensesDetails: {
        byCategory: expensesByCategory,
        list: expensesList
      },
      suppliersList,
      customersList
    });
  } catch (err) {
    console.error('Error fetching profits report:', err);
    res.status(500).json({ error: 'خطأ في جلب تقرير الأرباح' });
  }
});

module.exports = router;
