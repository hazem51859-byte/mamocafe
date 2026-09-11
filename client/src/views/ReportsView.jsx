import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, RefreshCw, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export default function ReportsView() {
  const [reportTab, setReportTab] = useState('sales'); // 'sales', 'profits'
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reportTab, startDate, endDate]);

  const exportCSV = (rows, headers, filename) => {
    if (!rows || rows.length === 0) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    const csvContent =
      '\uFEFF' +
      headers.join(',') +
      '\n' +
      rows
        .map(row =>
          headers
            .map(h => {
              const val = row[h] !== undefined ? String(row[h]).replace(/,/g, ' ') : '';
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
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn btn-sm ${reportTab === 'sales' ? 'btn-primary' : ''}`}
            onClick={() => setReportTab('sales')}
          >
            تقرير المبيعات والمنتجات
          </button>
          <button
            className={`btn btn-sm ${reportTab === 'profits' ? 'btn-primary' : ''}`}
            onClick={() => setReportTab('profits')}
          >
            تقرير الأرباح وهوامش الربحية
          </button>

          <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 4px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} style={{ color: '#64748b' }} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ fontSize: '12px' }}
            />
            <span style={{ fontSize: '11px', color: '#64748b' }}>إلى</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>

          <button className="btn btn-sm" onClick={loadReports}>
            <RefreshCw size={12} />
            <span>تحديث</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-sm"
            onClick={() => {
              if (reportTab === 'sales') {
                exportCSV(salesData?.topProducts || [], ['product_name', 'total_quantity', 'total_revenue', 'total_profit'], 'top_products_sales');
              } else {
                exportCSV(profitData?.profitByCategory || [], ['category_name', 'revenue', 'cogs', 'profit'], 'category_profits');
              }
            }}
          >
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Top Products Table */}
            <div className="pos-panel">
              <div className="pos-panel-header">
                <span>أكثر المنتجات مبيعاً وتحقيقاً للإيراد خلال الفترة</span>
              </div>
              <div className="table-container" style={{ maxHeight: '280px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>اسم المنتج</th>
                      <th>إجمالي الكمية المباعة</th>
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
                        <th>عدد الفواتير</th>
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
                        <th>عدد العمليات</th>
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
          /* Profits Tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Profit KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #234e70' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>إجمالي الإيرادات (المبيعات):</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800 }}>
                  {parseFloat(profitData?.summary?.revenue || 0).toFixed(2)} ج.م
                </div>
              </div>

              <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #475569' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>تكلفة البضاعة المباعة (COGS):</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800 }}>
                  {parseFloat(profitData?.summary?.costOfGoods || 0).toFixed(2)} ج.م
                </div>
              </div>

              <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #15803d' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>مجمل الربح (Gross Profit):</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#15803d' }}>
                  {parseFloat(profitData?.summary?.grossProfit || 0).toFixed(2)} ج.م
                </div>
              </div>

              <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #b71c1c' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>المصروفات التشغيلية:</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#b71c1c' }}>
                  {parseFloat(profitData?.summary?.expenses || 0).toFixed(2)} ج.م
                </div>
              </div>

              <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #0f172a' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>صافي الربح الفعلي (Net):</div>
                <div className="num-mono" style={{ fontSize: '18px', fontWeight: 900, color: '#15803d' }}>
                  {parseFloat(profitData?.summary?.netProfit || 0).toFixed(2)} ج.م
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>هامش: {profitData?.summary?.marginPercent}%</div>
              </div>
            </div>

            {/* Profits by Category */}
            <div className="pos-panel">
              <div className="pos-panel-header">
                <span>أرباح ومبيعات أقسام السوبر ماركت</span>
              </div>
              <div className="table-container" style={{ maxHeight: '300px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>القسم</th>
                      <th>إجمالي المبيعات</th>
                      <th>تكلفة البضاعة</th>
                      <th>الربح المحقق</th>
                      <th>نسبة الربح %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitData?.profitByCategory?.map((cat, i) => {
                      const rev = parseFloat(cat.revenue || 0);
                      const prof = parseFloat(cat.profit || 0);
                      const pct = rev > 0 ? ((prof / rev) * 100).toFixed(1) : 0;

                      return (
                        <tr key={i}>
                          <td className="num-mono">{i + 1}</td>
                          <td style={{ fontWeight: 700 }}>{cat.category_name}</td>
                          <td className="num-mono">{rev.toFixed(2)} ج.م</td>
                          <td className="num-mono">{parseFloat(cat.cogs || 0).toFixed(2)} ج.م</td>
                          <td className="num-mono" style={{ fontWeight: 800, color: '#15803d' }}>{prof.toFixed(2)} ج.م</td>
                          <td className="num-mono">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
