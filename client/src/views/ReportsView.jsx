import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, Printer, RefreshCw, Calendar, TrendingUp, DollarSign,
  Users, Truck, Receipt, Wallet, Search, ArrowUpRight, ArrowDownLeft,
  AlertTriangle, CheckCircle, FileText, Layers, Percent
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportsView() {
  const [reportTab, setReportTab] = useState('profits'); // default to profits per user's focus
  const [profitSubTab, setProfitSubTab] = useState('all'); // 'all', 'expenses', 'suppliers', 'customers', 'categories'
  
  // Date states
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Search filters
  const [supplierSearch, setSupplierSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');

  const [salesData, setSalesData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      if (reportTab === 'sales') {
        const res = await api.get('/reports/sales', { startDate, endDate });
        setSalesData(res);
      } else {
        const res = await api.get('/reports/profits', { startDate, endDate });
        setProfitData(res);
      }
    } catch (e) {
      console.error('Error loading reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reportTab, startDate, endDate]);

  const setDatePreset = (preset) => {
    const today = new Date().toISOString().slice(0, 10);
    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      setStartDate(weekAgo);
      setEndDate(today);
    } else if (preset === 'month') {
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
      setStartDate(firstOfMonth);
      setEndDate(today);
    } else if (preset === 'all') {
      setStartDate('2024-01-01');
      setEndDate(today);
    }
  };

  const exportCSV = (rows, headers, filename, arabicHeaders = null) => {
    if (!rows || rows.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    const headerRow = arabicHeaders ? arabicHeaders.join(',') : headers.join(',');
    const csvContent =
      '\uFEFF' +
      headerRow +
      '\n' +
      rows
        .map(row =>
          headers
            .map(h => {
              const val = row[h] !== undefined && row[h] !== null ? String(row[h]).replace(/,/g, ' ').replace(/"/g, '""') : '';
              return `"${val}"`;
            })
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (reportTab === 'sales') {
      exportCSV(
        salesData?.topProducts || [],
        ['product_name', 'total_quantity', 'unit', 'total_revenue', 'total_profit'],
        'top_products_sales',
        ['اسم المنتج', 'الكمية المباعة', 'الوحدة', 'إجمالي الإيراد', 'إجمالي الربح']
      );
      return;
    }

    // Profits Tab Export based on sub-tab
    if (profitSubTab === 'suppliers') {
      exportCSV(
        profitData?.suppliersList || [],
        ['name', 'company', 'phone', 'current_balance', 'total_purchases', 'total_paid', 'last_invoice_date'],
        'suppliers_debts_report',
        ['اسم المورد', 'الشركة', 'الهاتف', 'الرصيد المستحق (ج.م)', 'إجمالي المشتريات', 'إجمالي المدفوع', 'آخر فاتورة']
      );
    } else if (profitSubTab === 'customers') {
      exportCSV(
        profitData?.customersList || [],
        ['name', 'phone', 'address', 'balance', 'credit_limit', 'total_spent', 'last_sale_date'],
        'customers_debts_report',
        ['اسم العميل', 'الهاتف', 'العنوان', 'المديونية المستحقة (ج.م)', 'حد الائتمان', 'إجمالي المسحوبات', 'آخر عملية شراء']
      );
    } else if (profitSubTab === 'expenses') {
      exportCSV(
        profitData?.expensesDetails?.list || [],
        ['expense_date', 'category', 'amount', 'employee_name', 'notes'],
        'expenses_details_report',
        ['التاريخ', 'بند المصروف', 'المبلغ (ج.م)', 'الموظف المسؤول', 'البيان والملاحظات']
      );
    } else {
      exportCSV(
        profitData?.profitByCategory || [],
        ['category_name', 'revenue', 'cogs', 'profit'],
        'category_profits_report',
        ['القسم', 'إجمالي المبيعات (ج.م)', 'تكلفة البضاعة (ج.م)', 'الربح المحقق (ج.م)']
      );
    }
  };

  // Filtered lists
  const filteredSuppliers = (profitData?.suppliersList || []).filter(s => {
    if (!supplierSearch.trim()) return true;
    const q = supplierSearch.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) ||
           (s.company || '').toLowerCase().includes(q) ||
           (s.phone || '').includes(q);
  });

  const filteredCustomers = (profitData?.customersList || []).filter(c => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) ||
           (c.phone || '').includes(q) ||
           (c.address || '').toLowerCase().includes(q);
  });

  const filteredExpenses = (profitData?.expensesDetails?.list || []).filter(e => {
    if (!expenseSearch.trim()) return true;
    const q = expenseSearch.toLowerCase();
    return (e.category || '').toLowerCase().includes(q) ||
           (e.notes || '').toLowerCase().includes(q) ||
           (e.employee_name || '').toLowerCase().includes(q);
  });

  const summary = profitData?.summary;
  const isNetPositive = (summary?.netProfit || 0) >= 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {/* Top Filter Bar */}
      <div
        className="pos-toolbar no-print"
        style={{
          background: '#ffffff',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div className="btn-group" style={{ display: 'inline-flex' }}>
            <button
              className={`btn btn-sm ${reportTab === 'profits' ? 'btn-primary' : ''}`}
              onClick={() => setReportTab('profits')}
              style={{ fontWeight: 700 }}
            >
              <TrendingUp size={13} />
              <span>تقرير الأرباح والمركز المالي الشامل</span>
            </button>
            <button
              className={`btn btn-sm ${reportTab === 'sales' ? 'btn-primary' : ''}`}
              onClick={() => setReportTab('sales')}
            >
              <BarChart3 size={13} />
              <span>تقرير المبيعات والمنتجات</span>
            </button>
          </div>

          <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px' }} />

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="btn btn-sm" onClick={() => setDatePreset('today')} style={{ fontSize: '11px', padding: '4px 8px' }}>
              اليوم
            </button>
            <button className="btn btn-sm" onClick={() => setDatePreset('week')} style={{ fontSize: '11px', padding: '4px 8px' }}>
              أسبوع
            </button>
            <button className="btn btn-sm" onClick={() => setDatePreset('month')} style={{ fontSize: '11px', padding: '4px 8px' }}>
              هذا الشهر
            </button>
            <button className="btn btn-sm" onClick={() => setDatePreset('all')} style={{ fontSize: '11px', padding: '4px 8px' }}>
              الكل
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '3px 8px', borderRadius: '3px', border: '1px solid #cbd5e1' }}>
            <Calendar size={13} style={{ color: '#475569' }} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ fontSize: '12px', border: 'none', background: 'transparent', padding: '2px' }}
            />
            <span style={{ fontSize: '11px', color: '#64748b' }}>إلى</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ fontSize: '12px', border: 'none', background: 'transparent', padding: '2px' }}
            />
          </div>

          <button className="btn btn-sm" onClick={loadReports} title="تحديث البيانات">
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>{loading ? 'جاري التحميل...' : 'تحديث'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={handleExport} title="تصدير بيانات التقرير الحالي">
            <Download size={13} />
            <span>تصدير Excel (CSV)</span>
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => window.print()}>
            <Printer size={13} />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {reportTab === 'sales' ? (
          /* Sales Tab Content */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="pos-panel">
              <div className="pos-panel-header">
                <span>أكثر المنتجات مبيعاً وتحقيقاً للإيراد خلال الفترة</span>
              </div>
              <div className="table-container" style={{ maxHeight: '300px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                      <th>اسم المنتج</th>
                      <th style={{ textAlign: 'center' }}>إجمالي الكمية المباعة</th>
                      <th>إجمالي الإيراد</th>
                      <th>إجمالي الربح من الصنف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData?.topProducts?.map((p, idx) => (
                      <tr key={p.product_id}>
                        <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{p.product_name}</td>
                        <td className="num-mono" style={{ textAlign: 'center' }}>{p.total_quantity} {p.unit}</td>
                        <td className="num-mono" style={{ fontWeight: 700 }}>{parseFloat(p.total_revenue).toFixed(2)} ج.م</td>
                        <td className="num-mono" style={{ color: '#15803d', fontWeight: 800 }}>
                          {parseFloat(p.total_profit).toFixed(2)} ج.م
                        </td>
                      </tr>
                    ))}
                    {(!salesData?.topProducts || salesData.topProducts.length === 0) && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          لا توجد مبيعات مسجلة خلال الفترة المحددة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Split Grid: By Cashier & By Payment Method */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="pos-panel">
                <div className="pos-panel-header">
                  <span>مبيعات الكاشير والموظفين</span>
                </div>
                <div className="table-container" style={{ maxHeight: '200px' }}>
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>الكاشير</th>
                        <th style={{ textAlign: 'center' }}>عدد الفواتير</th>
                        <th>إجمالي المبيعات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData?.byCashier?.map((c, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{c.cashier_name}</td>
                          <td className="num-mono" style={{ textAlign: 'center' }}>{c.invoices_count}</td>
                          <td className="num-mono" style={{ fontWeight: 800 }}>{parseFloat(c.total_sales).toFixed(2)} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pos-panel">
                <div className="pos-panel-header">
                  <span>مبيعات طرق السداد</span>
                </div>
                <div className="table-container" style={{ maxHeight: '200px' }}>
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>طريقة الدفع</th>
                        <th style={{ textAlign: 'center' }}>عدد العمليات</th>
                        <th>الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData?.byPaymentMethod?.map((pm, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{pm.payment_method}</td>
                          <td className="num-mono" style={{ textAlign: 'center' }}>{pm.count}</td>
                          <td className="num-mono" style={{ fontWeight: 800 }}>{parseFloat(pm.total).toFixed(2)} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Profits & Comprehensive Financial Tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* MASTER 8-KPI FINANCIAL HEALTH STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
              
              {/* 1. Revenue */}
              <div className="pos-panel" style={{ padding: '8px 10px', borderTop: '3px solid #234e70' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>إجمالي الإيرادات (المبيعات):</div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {parseFloat(summary?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>خلال الفترة المحددة</div>
              </div>

              {/* 2. COGS */}
              <div className="pos-panel" style={{ padding: '8px 10px', borderTop: '3px solid #475569' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>تكلفة البضاعة المباعة:</div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                  {parseFloat(summary?.costOfGoods || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>سعر شراء الأصناف</div>
              </div>

              {/* 3. Gross Profit */}
              <div className="pos-panel" style={{ padding: '8px 10px', borderTop: '3px solid #16a34a' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>مجمل الربح (Gross):</div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                  {parseFloat(summary?.grossProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#16a34a', marginTop: '2px' }}>هامش: {summary?.marginPercent || 0}%</div>
              </div>

              {/* 4. Operating Expenses */}
              <div
                className="pos-panel"
                style={{ padding: '8px 10px', borderTop: '3px solid #dc2626', cursor: 'pointer' }}
                onClick={() => setProfitSubTab('expenses')}
                title="اضغط لعرض تفاصيل المصروفات"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>المصروفات التشغيلية:</span>
                  <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                    {profitData?.expensesDetails?.list?.length || 0} حركة
                  </span>
                </div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                  {parseFloat(summary?.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '2px' }}>إيجار، كهرباء، رواتب...</div>
              </div>

              {/* 5. Net Profit */}
              <div className="pos-panel" style={{ padding: '8px 10px', borderTop: `3px solid ${isNetPositive ? '#15803d' : '#b91c1c'}` }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>صافي الربح الفعلي (Net):</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 900, color: isNetPositive ? '#15803d' : '#b91c1c', marginTop: '2px' }}>
                  {parseFloat(summary?.netProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: isNetPositive ? '#15803d' : '#b91c1c', marginTop: '2px' }}>
                  صافي الهامش: {summary?.netMarginPercent || 0}%
                </div>
              </div>

              {/* 6. Supplier Payables */}
              <div
                className="pos-panel"
                style={{ padding: '8px 10px', borderTop: '3px solid #d97706', cursor: 'pointer' }}
                onClick={() => setProfitSubTab('suppliers')}
                title="اضغط لعرض مستحقات الموردين بالتفصيل"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>مستحقات الموردين:</span>
                  <span style={{ fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                    {summary?.creditorsCount || 0} مورد
                  </span>
                </div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                  {parseFloat(summary?.totalSupplierDebts || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#b45309', marginTop: '2px' }}>فلوس علينا للموردين</div>
              </div>

              {/* 7. Customer Receivables */}
              <div
                className="pos-panel"
                style={{ padding: '8px 10px', borderTop: '3px solid #0284c7', cursor: 'pointer' }}
                onClick={() => setProfitSubTab('customers')}
                title="اضغط لعرض ديون العملاء بالتفصيل"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ديون العملاء (الآجل):</span>
                  <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                    {summary?.debtorsCount || 0} عميل
                  </span>
                </div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>
                  {parseFloat(summary?.totalCustomerDebts || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#0369a1', marginTop: '2px' }}>فلوسنا برة في السوق</div>
              </div>

              {/* 8. Working Position */}
              <div className="pos-panel" style={{ padding: '8px 10px', borderTop: '3px solid #4f46e5' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>صافي الموقف المالي:</div>
                <div
                  className="num-mono"
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: (summary?.financialPosition || 0) >= 0 ? '#15803d' : '#b91c1c',
                    marginTop: '2px'
                  }}
                >
                  {parseFloat(summary?.financialPosition || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>الربح + العملاء - الموردين</div>
              </div>

            </div>

            {/* SUB-TABS NAVIGATION TOOLBAR */}
            <div
              className="pos-toolbar no-print"
              style={{
                background: '#ffffff',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${profitSubTab === 'all' ? 'btn-primary' : ''}`}
                  onClick={() => setProfitSubTab('all')}
                  style={{ fontWeight: 700 }}
                >
                  <Layers size={13} />
                  <span>عرض شامل لجميع التقارير (All-in-One)</span>
                </button>

                <button
                  className={`btn btn-sm ${profitSubTab === 'expenses' ? 'btn-primary' : ''}`}
                  onClick={() => setProfitSubTab('expenses')}
                >
                  <Receipt size={13} />
                  <span>تفاصيل المصروفات</span>
                  <span style={{ background: profitSubTab === 'expenses' ? '#ffffff' : '#fee2e2', color: profitSubTab === 'expenses' ? '#b91c1c' : '#b91c1c', padding: '1px 5px', borderRadius: '3px', fontSize: '10.5px', fontWeight: 800, marginRight: '4px' }}>
                    {parseFloat(summary?.expenses || 0).toLocaleString()} ج.م
                  </span>
                </button>

                <button
                  className={`btn btn-sm ${profitSubTab === 'suppliers' ? 'btn-primary' : ''}`}
                  onClick={() => setProfitSubTab('suppliers')}
                >
                  <Truck size={13} />
                  <span>مستحقات الموردين (علينا)</span>
                  <span style={{ background: profitSubTab === 'suppliers' ? '#ffffff' : '#fef3c7', color: profitSubTab === 'suppliers' ? '#b45309' : '#b45309', padding: '1px 5px', borderRadius: '3px', fontSize: '10.5px', fontWeight: 800, marginRight: '4px' }}>
                    {parseFloat(summary?.totalSupplierDebts || 0).toLocaleString()} ج.م
                  </span>
                </button>

                <button
                  className={`btn btn-sm ${profitSubTab === 'customers' ? 'btn-primary' : ''}`}
                  onClick={() => setProfitSubTab('customers')}
                >
                  <Users size={13} />
                  <span>ديون العملاء (لنا)</span>
                  <span style={{ background: profitSubTab === 'customers' ? '#ffffff' : '#e0f2fe', color: profitSubTab === 'customers' ? '#0369a1' : '#0369a1', padding: '1px 5px', borderRadius: '3px', fontSize: '10.5px', fontWeight: 800, marginRight: '4px' }}>
                    {parseFloat(summary?.totalCustomerDebts || 0).toLocaleString()} ج.م
                  </span>
                </button>

                <button
                  className={`btn btn-sm ${profitSubTab === 'categories' ? 'btn-primary' : ''}`}
                  onClick={() => setProfitSubTab('categories')}
                >
                  <BarChart3 size={13} />
                  <span>أرباح الأقسام</span>
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b' }}>
                الفترة: من <strong className="num-mono">{startDate}</strong> إلى <strong className="num-mono">{endDate}</strong>
              </div>
            </div>

            {/* =========================================================
                SECTION 1: EXPENSES BREAKDOWN & DETAILS
               ========================================================= */}
            {(profitSubTab === 'all' || profitSubTab === 'expenses') && (
              <div className="pos-panel" style={{ borderTop: '3px solid #dc2626' }}>
                <div className="pos-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Receipt size={15} style={{ color: '#dc2626' }} />
                    <span style={{ fontWeight: 800 }}>تفاصيل وتحليل المصروفات التشغيلية خلال الفترة</span>
                    <span className="badge badge-danger" style={{ fontSize: '11px' }}>
                      إجمالي: {parseFloat(summary?.expenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </span>
                  </div>
                  <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={13} style={{ color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="بحث في المصروفات..."
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      style={{ padding: '3px 8px', fontSize: '11.5px', width: '160px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: profitSubTab === 'expenses' ? '1fr 2fr' : '1fr 1.6fr', gap: '10px', padding: '10px' }}>
                  {/* Category Breakdown Table */}
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ padding: '6px 10px', background: '#e2e8f0', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                      توزيع المصروفات حسب البند:
                    </div>
                    <div className="table-container" style={{ maxHeight: '240px' }}>
                      <table className="dense-table">
                        <thead>
                          <tr>
                            <th>البند</th>
                            <th style={{ textAlign: 'center' }}>العدد</th>
                            <th>الإجمالي</th>
                            <th style={{ width: '85px' }}>النسبة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profitData?.expensesDetails?.byCategory?.map((cat, i) => {
                            const expTotal = parseFloat(summary?.expenses || 0);
                            const catTotal = parseFloat(cat.total || 0);
                            const pct = expTotal > 0 ? ((catTotal / expTotal) * 100).toFixed(1) : 0;
                            return (
                              <tr key={i}>
                                <td style={{ fontWeight: 700 }}>{cat.category}</td>
                                <td className="num-mono" style={{ textAlign: 'center' }}>{cat.count}</td>
                                <td className="num-mono" style={{ fontWeight: 700, color: '#b91c1c' }}>{catTotal.toFixed(2)} ج.م</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: '#dc2626' }} />
                                    </div>
                                    <span className="num-mono" style={{ fontSize: '10px', fontWeight: 700 }}>{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {(!profitData?.expensesDetails?.byCategory || profitData.expensesDetails.byCategory.length === 0) && (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '14px', color: '#64748b' }}>
                                لا توجد مصروفات مسجلة في هذه الفترة
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Expenses List */}
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ padding: '6px 10px', background: '#e2e8f0', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                      سجل حركات المصروفات المسجلة ({filteredExpenses.length} حركة):
                    </div>
                    <div className="table-container" style={{ maxHeight: '240px' }}>
                      <table className="dense-table">
                        <thead>
                          <tr>
                            <th style={{ width: '85px' }}>التاريخ</th>
                            <th>البند</th>
                            <th>المبلغ</th>
                            <th>المسؤول</th>
                            <th>البيان والملاحظات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExpenses.map((exp) => (
                            <tr key={exp.id}>
                              <td className="num-mono" style={{ fontSize: '11px' }}>{exp.expense_date}</td>
                              <td style={{ fontWeight: 700 }}>{exp.category}</td>
                              <td className="num-mono" style={{ fontWeight: 800, color: '#b91c1c' }}>
                                {parseFloat(exp.amount).toFixed(2)} ج.م
                              </td>
                              <td style={{ fontSize: '11.5px', color: '#475569' }}>{exp.employee_name || '—'}</td>
                              <td style={{ fontSize: '11.5px', color: '#334155' }}>{exp.notes || '—'}</td>
                            </tr>
                          ))}
                          {filteredExpenses.length === 0 && (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '14px', color: '#64748b' }}>
                                لا توجد حركات مصروفات مطابقة للبحث
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 2: SUPPLIER PAYABLES (الفلوس اللي للموردين)
               ========================================================= */}
            {(profitSubTab === 'all' || profitSubTab === 'suppliers') && (
              <div className="pos-panel" style={{ borderTop: '3px solid #d97706' }}>
                <div className="pos-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={15} style={{ color: '#d97706' }} />
                    <span style={{ fontWeight: 800 }}>مستحقات الموردين (الفلوس المطلوبة منا للشركات والموردين)</span>
                    <span className="badge badge-warning" style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309' }}>
                      إجمالي الديون: {parseFloat(summary?.totalSupplierDebts || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      ({profitData?.suppliersList?.length || 0} مورد دائن)
                    </span>
                  </div>

                  <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={13} style={{ color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="بحث باسم المورد أو الهاتف..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      style={{ padding: '3px 8px', fontSize: '11.5px', width: '200px' }}
                    />
                  </div>
                </div>

                {/* Suppliers Quick Stats Strip */}
                <div style={{ display: 'flex', gap: '12px', padding: '6px 12px', background: '#fffbeb', borderBottom: '1px solid #fde68a', fontSize: '11.5px' }}>
                  <span>إجمالي المديونية للموردين: <strong className="num-mono" style={{ color: '#b45309' }}>{parseFloat(summary?.totalSupplierDebts || 0).toLocaleString()} ج.م</strong></span>
                  <span>•</span>
                  <span>مشتريات الفترة: <strong className="num-mono">{parseFloat(summary?.totalPurchases || 0).toLocaleString()} ج.م</strong> ({summary?.purchasesCount || 0} فاتورة)</span>
                  <span>•</span>
                  <span>مسدد للموردين في الفترة: <strong className="num-mono" style={{ color: '#15803d' }}>{parseFloat(summary?.supplierPaymentsPeriod || 0).toLocaleString()} ج.م</strong></span>
                </div>

                <div className="table-container" style={{ maxHeight: profitSubTab === 'suppliers' ? '450px' : '260px' }}>
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                        <th>اسم المورد</th>
                        <th>الشركة / النشاط</th>
                        <th style={{ width: '110px' }}>رقم الهاتف</th>
                        <th style={{ background: '#fef3c7', color: '#b45309' }}>المبلغ المستحق له (الرصيد)</th>
                        <th>إجمالي المشتريات منه</th>
                        <th>إجمالي المسدد له</th>
                        <th>تاريخ آخر فاتورة</th>
                        <th style={{ textAlign: 'center' }}>حالة الحساب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((sup, idx) => (
                        <tr key={sup.id}>
                          <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 700 }}>{sup.name}</td>
                          <td style={{ color: '#475569' }}>{sup.company || '—'}</td>
                          <td className="num-mono" style={{ direction: 'ltr', textAlign: 'right' }}>{sup.phone || '—'}</td>
                          <td className="num-mono" style={{ fontWeight: 800, color: '#b45309', background: '#fffbeb', fontSize: '14px' }}>
                            {parseFloat(sup.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                          </td>
                          <td className="num-mono">{parseFloat(sup.total_purchases).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                          <td className="num-mono" style={{ color: '#15803d' }}>{parseFloat(sup.total_paid).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                          <td className="num-mono" style={{ fontSize: '11px', color: '#64748b' }}>{sup.last_invoice_date || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-warning" style={{ fontSize: '10.5px' }}>
                              مستحق السداد
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredSuppliers.length === 0 && (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                            لا توجد مستحقات أو ديون للموردين مطابقة للبحث
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 3: CUSTOMER RECEIVABLES (ديون العملاء)
               ========================================================= */}
            {(profitSubTab === 'all' || profitSubTab === 'customers') && (
              <div className="pos-panel" style={{ borderTop: '3px solid #0284c7' }}>
                <div className="pos-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} style={{ color: '#0284c7' }} />
                    <span style={{ fontWeight: 800 }}>ديون وحسابات العملاء (الفلوس اللي للمحل في السوق عند الزبائن)</span>
                    <span className="badge badge-primary" style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1' }}>
                      إجمالي ديون العملاء: {parseFloat(summary?.totalCustomerDebts || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      ({profitData?.customersList?.length || 0} عميل مدين)
                    </span>
                  </div>

                  <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={13} style={{ color: '#64748b' }} />
                    <input
                      type="text"
                      placeholder="بحث باسم العميل أو الهاتف..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      style={{ padding: '3px 8px', fontSize: '11.5px', width: '200px' }}
                    />
                  </div>
                </div>

                {/* Customers Quick Stats Strip */}
                <div style={{ display: 'flex', gap: '12px', padding: '6px 12px', background: '#f0f9ff', borderBottom: '1px solid #bae6fd', fontSize: '11.5px' }}>
                  <span>إجمالي الفلوس اللي برة: <strong className="num-mono" style={{ color: '#0369a1' }}>{parseFloat(summary?.totalCustomerDebts || 0).toLocaleString()} ج.م</strong></span>
                  <span>•</span>
                  <span>محصلات ديون في الفترة: <strong className="num-mono" style={{ color: '#15803d' }}>{parseFloat(summary?.customerPaymentsPeriod || 0).toLocaleString()} ج.م</strong></span>
                </div>

                <div className="table-container" style={{ maxHeight: profitSubTab === 'customers' ? '450px' : '260px' }}>
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                        <th>اسم العميل</th>
                        <th style={{ width: '110px' }}>رقم الهاتف</th>
                        <th>العنوان / المنطقة</th>
                        <th style={{ background: '#e0f2fe', color: '#0369a1' }}>المبلغ المستحق عليه (المديونية)</th>
                        <th>الحد الائتماني</th>
                        <th style={{ width: '100px' }}>نسبة الاستهلاك</th>
                        <th>إجمالي مسحوباته</th>
                        <th>تاريخ آخر عملية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((cust, idx) => {
                        const bal = parseFloat(cust.balance || 0);
                        const limit = parseFloat(cust.credit_limit || 5000);
                        const usagePct = limit > 0 ? ((bal / limit) * 100).toFixed(0) : 0;
                        const isOverLimit = bal > limit;

                        return (
                          <tr key={cust.id}>
                            <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td style={{ fontWeight: 700 }}>{cust.name}</td>
                            <td className="num-mono" style={{ direction: 'ltr', textAlign: 'right' }}>{cust.phone || '—'}</td>
                            <td style={{ color: '#475569', fontSize: '12px' }}>{cust.address || '—'}</td>
                            <td className="num-mono" style={{ fontWeight: 800, color: '#0369a1', background: '#f0f9ff', fontSize: '14px' }}>
                              {bal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                            </td>
                            <td className="num-mono">{limit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, usagePct)}%`,
                                      height: '100%',
                                      background: isOverLimit ? '#dc2626' : usagePct > 75 ? '#f59e0b' : '#0284c7'
                                    }}
                                  />
                                </div>
                                <span
                                  className="num-mono"
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: isOverLimit ? '#dc2626' : '#475569'
                                  }}
                                >
                                  {usagePct}%
                                </span>
                              </div>
                            </td>
                            <td className="num-mono">{parseFloat(cust.total_spent).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                            <td className="num-mono" style={{ fontSize: '11px', color: '#64748b' }}>{cust.last_sale_date || '—'}</td>
                          </tr>
                        );
                      })}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                            لا توجد ديون عملاء مسجلة مطابقة للبحث
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================
                SECTION 4: CATEGORY PROFITS & MARGINS
               ========================================================= */}
            {(profitSubTab === 'all' || profitSubTab === 'categories') && (
              <div className="pos-panel" style={{ borderTop: '3px solid #16a34a' }}>
                <div className="pos-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BarChart3 size={15} style={{ color: '#16a34a' }} />
                    <span style={{ fontWeight: 800 }}>تحليل أرباح ومبيعات وهوامش أقسام السوبر ماركت</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    مرتبة حسب الأكثر ربحية
                  </div>
                </div>

                <div className="table-container" style={{ maxHeight: profitSubTab === 'categories' ? '450px' : '260px' }}>
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                        <th>اسم القسم</th>
                        <th>إجمالي مبيعات القسم</th>
                        <th>تكلفة البضاعة (COGS)</th>
                        <th>الربح المحقق</th>
                        <th style={{ width: '120px' }}>نسبة هامش الربح %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitData?.profitByCategory?.map((cat, i) => {
                        const rev = parseFloat(cat.revenue || 0);
                        const prof = parseFloat(cat.profit || 0);
                        const pct = rev > 0 ? ((prof / rev) * 100).toFixed(1) : 0;

                        return (
                          <tr key={i}>
                            <td className="num-mono" style={{ textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ fontWeight: 700 }}>{cat.category_name}</td>
                            <td className="num-mono">{rev.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                            <td className="num-mono">{parseFloat(cat.cogs || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م</td>
                            <td className="num-mono" style={{ fontWeight: 800, color: '#15803d' }}>
                              {prof.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(100, Math.max(0, pct))}%`,
                                      height: '100%',
                                      background: pct > 20 ? '#16a34a' : pct > 10 ? '#0284c7' : '#f59e0b'
                                    }}
                                  />
                                </div>
                                <span className="num-mono" style={{ fontSize: '11px', fontWeight: 800, color: '#15803d' }}>{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(!profitData?.profitByCategory || profitData.profitByCategory.length === 0) && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                            لا توجد بيانات مبيعات أو أرباح للأقسام خلال الفترة
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
