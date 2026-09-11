import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  ShoppingCart,
  Wallet,
  Coins,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardView({ onNavigate, onOpenInvoice }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
        جاري تحميل المؤشرات والبيانات التشغيلية...
      </div>
    );
  }

  const m = data?.metrics || {};
  const recentSales = data?.recentSales || [];
  const salesTrend = data?.salesTrend || [];

  // Simple sales comparison
  const salesDiff = m.todaySales - m.yesterdaySales;
  const isUp = salesDiff >= 0;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '10px' }}>
      {/* Top Bar / Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          background: '#ffffff',
          padding: '6px 12px',
          border: '1px solid #cbd5e1'
        }}
      >
        <div>
          <h2 style={{ fontSize: '15px', color: '#162433' }}>
            لوحة مؤشرات الأداء والتشغيل اليومي
          </h2>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            ملخص حركة المبيعات، المخزون، والأرباح اللحظية
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-sm" onClick={fetchDashboard}>
            <RefreshCw size={13} />
            <span>تحديث البيانات</span>
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => onNavigate('pos')}>
            <ShoppingCart size={13} />
            <span>شاشة الكاشير (POS)</span>
          </button>
        </div>
      </div>

      {/* Row 1: Primary Metrics Grid (Traditional dense rectangular panels) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '10px'
        }}
      >
        {/* Today's Sales */}
        <div className="pos-panel" style={{ borderTop: '3px solid #234e70', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569', fontSize: '11.5px', fontWeight: 700 }}>
            <span>مبيعات اليوم (Today)</span>
            <span className="badge badge-info">{m.todayInvoices || 0} فاتورة</span>
          </div>
          <div className="num-mono" style={{ fontSize: '20px', fontWeight: 800, color: '#162433', margin: '4px 0' }}>
            {parseFloat(m.todaySales || 0).toFixed(2)} <span style={{ fontSize: '12px' }}>ج.م</span>
          </div>
          <div style={{ fontSize: '10.5px', color: isUp ? '#15803d' : '#b91c1c', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>مقارنة بأمس: {Math.abs(salesDiff).toFixed(2)} ج.م ({isUp ? 'زيادة' : 'انخفاض'})</span>
          </div>
        </div>

        {/* Yesterday & This Month */}
        <div className="pos-panel" style={{ borderTop: '3px solid #475569', padding: '8px 12px' }}>
          <div style={{ color: '#475569', fontSize: '11.5px', fontWeight: 700 }}>
            مبيعات أمس والشهر الحالي
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>أمس:</div>
              <div className="num-mono" style={{ fontSize: '14px', fontWeight: 700 }}>
                {parseFloat(m.yesterdaySales || 0).toFixed(2)} ج.م
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>هذا الشهر:</div>
              <div className="num-mono" style={{ fontSize: '14px', fontWeight: 800, color: '#234e70' }}>
                {parseFloat(m.thisMonthSales || 0).toFixed(2)} ج.م
              </div>
            </div>
          </div>
        </div>

        {/* Gross & Net Profit */}
        <div className="pos-panel" style={{ borderTop: '3px solid #1b5e20', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '11.5px', fontWeight: 700 }}>
            <span>مجمل وصافي أرباح اليوم</span>
            <span className="badge badge-success">ربح تشغيلي</span>
          </div>
          <div className="num-mono" style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>
            {parseFloat(m.grossProfit || 0).toFixed(2)} <span style={{ fontSize: '12px' }}>ج.م</span>
          </div>
          <div style={{ fontSize: '11px', color: '#475569' }}>
            الصافي بعد المصروفات: <strong className="num-mono" style={{ color: '#162433' }}>{parseFloat(m.netProfit || 0).toFixed(2)} ج.م</strong>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="pos-panel" style={{ borderTop: '3px solid #b45309', padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '11.5px', fontWeight: 700 }}>
            <span>نقدية الدرج الفعلية (الخزينة)</span>
            <span className="badge badge-warning">الشيفت الجاري</span>
          </div>
          <div className="num-mono" style={{ fontSize: '20px', fontWeight: 800, color: '#b45309', margin: '4px 0' }}>
            {parseFloat(m.cashInDrawer || 0).toFixed(2)} <span style={{ fontSize: '12px' }}>ج.م</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            مشتريات اليوم: <span className="num-mono">{parseFloat(m.todayPurchases || 0).toFixed(2)} ج.م</span>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Quick Stats (Debts, Expenses, Inventory alerts) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginBottom: '10px'
        }}
      >
        <div className="pos-panel" style={{ padding: '6px 10px', background: '#f8fafc' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>مصروفات اليوم:</div>
          <div className="num-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#b71c1c' }}>
            {parseFloat(m.todayExpenses || 0).toFixed(2)} ج.م
          </div>
        </div>

        <div className="pos-panel" style={{ padding: '6px 10px', background: '#f8fafc' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>ديون العملاء المستحقة:</div>
          <div className="num-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#b45309' }}>
            {parseFloat(m.customerDebts || 0).toFixed(2)} ج.م
          </div>
        </div>

        <div className="pos-panel" style={{ padding: '6px 10px', background: '#f8fafc' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>مستحقات الموردين:</div>
          <div className="num-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#475569' }}>
            {parseFloat(m.supplierDebts || 0).toFixed(2)} ج.م
          </div>
        </div>

        <div
          className="pos-panel"
          style={{ padding: '6px 10px', background: m.lowStockCount > 0 ? '#fffbeb' : '#f8fafc', cursor: 'pointer' }}
          onClick={() => onNavigate('inventory')}
        >
          <div style={{ fontSize: '11px', color: m.lowStockCount > 0 ? '#b45309' : '#64748b' }}>
            أصناف أوشكت على النفاد:
          </div>
          <div className="num-mono" style={{ fontSize: '15px', fontWeight: 800, color: m.lowStockCount > 0 ? '#b45309' : '#0f172a' }}>
            {m.lowStockCount || 0} صنف
          </div>
        </div>

        <div
          className="pos-panel"
          style={{ padding: '6px 10px', background: m.expiredCount > 0 ? '#fef2f2' : '#f8fafc', cursor: 'pointer' }}
          onClick={() => onNavigate('inventory')}
        >
          <div style={{ fontSize: '11px', color: m.expiredCount > 0 ? '#b71c1c' : '#64748b' }}>
            أصناف منتهية الصلاحية:
          </div>
          <div className="num-mono" style={{ fontSize: '15px', fontWeight: 800, color: m.expiredCount > 0 ? '#b71c1c' : '#0f172a' }}>
            {m.expiredCount || 0} صنف
          </div>
        </div>
      </div>

      {/* Row 3: Split Table & Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
        {/* Recent Invoices Table */}
        <div className="pos-panel">
          <div className="pos-panel-header">
            <span>آخر الفواتير والعمليات المنفذة</span>
            <button className="btn btn-sm" onClick={() => onNavigate('sales')}>
              عرض كل الفواتير
            </button>
          </div>

          <div className="table-container" style={{ maxHeight: '310px' }}>
            <table className="dense-table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>الكاشير</th>
                  <th>العميل</th>
                  <th>الإجمالي</th>
                  <th>الدفع</th>
                  <th>الوقت</th>
                  <th>معاينة</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(s => (
                  <tr key={s.id}>
                    <td className="num-mono" style={{ fontWeight: 700 }}>
                      {s.invoice_number}
                    </td>
                    <td>{s.cashier_name}</td>
                    <td>{s.customer_name || 'نقدي عام'}</td>
                    <td className="num-mono" style={{ fontWeight: 700 }}>
                      {parseFloat(s.grand_total).toFixed(2)} ج.م
                    </td>
                    <td>
                      <span className="badge badge-navy">
                        {s.payment_method === 'cash' && 'نقدي'}
                        {s.payment_method === 'visa' && 'فيزا'}
                        {s.payment_method === 'credit' && 'آجل'}
                        {s.payment_method === 'mixed' && 'مركب'}
                        {s.payment_method === 'wallet' && 'محفظة'}
                        {s.payment_method === 'instapay' && 'إنستاباي'}
                      </span>
                    </td>
                    <td className="num-mono" style={{ fontSize: '11px' }}>
                      {new Date(s.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => onOpenInvoice(s.id)}
                        title="طباعة / معاينة"
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traditional Sales Trend / Daily Breakdown */}
        <div className="pos-panel">
          <div className="pos-panel-header">
            <span>حركة المبيعات خلال الأيام الـ 7 الأخيرة</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>توزيع يومي</span>
          </div>

          <div style={{ padding: '10px' }}>
            <div className="table-container" style={{ maxHeight: '270px' }}>
              <table className="dense-table">
                <thead>
                  <tr>
                    <th>اليوم والتاريخ</th>
                    <th>عدد الفواتير</th>
                    <th>إجمالي المبيعات</th>
                  </tr>
                </thead>
                <tbody>
                  {salesTrend.map((t, idx) => (
                    <tr key={idx}>
                      <td className="num-mono" style={{ fontWeight: 600 }}>
                        {t.day_date}
                      </td>
                      <td className="num-mono" style={{ textAlign: 'center' }}>
                        {t.invoices_count}
                      </td>
                      <td className="num-mono" style={{ fontWeight: 700, color: '#234e70' }}>
                        {parseFloat(t.total_sales).toFixed(2)} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
