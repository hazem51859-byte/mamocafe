import React, { useState, useEffect } from 'react';
import { Receipt, Search, Eye, Printer, RefreshCw, Filter } from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';

export default function SalesView({ onOpenReceipt }) {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Details Modal
  const [selectedSale, setSelectedSale] = useState(null);

  const loadSales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales', {
        search,
        paymentMethod,
        startDate,
        endDate,
        limit: 100
      });
      setSales(res.sales || []);
      setSummary(res.summary || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadSales, 250);
    return () => clearTimeout(t);
  }, [search, paymentMethod, startDate, endDate]);

  const viewSaleDetails = async (saleId) => {
    try {
      const res = await api.get(`/sales/${saleId}`);
      setSelectedSale(res);
    } catch (e) {
      alert('فشل تحميل تفاصيل الفاتورة');
    }
  };

  const columns = [
    {
      key: 'id',
      label: '#',
      width: '45px',
      minWidth: '45px',
      align: 'center',
      className: 'num-mono',
      render: (_, idx) => idx + 1
    },
    {
      key: 'invoice_number',
      label: 'رقم الفاتورة',
      minWidth: '140px',
      className: 'num-mono',
      render: s => <span style={{ fontWeight: 800 }}>{s.invoice_number}</span>
    },
    {
      key: 'cashier_name',
      label: 'الكاشير',
      minWidth: '130px',
      render: s => s.cashier_name
    },
    {
      key: 'customer_name',
      label: 'العميل',
      minWidth: '140px',
      render: s => s.customer_name || 'نقدي عام'
    },
    {
      key: 'subtotal',
      label: 'المجموع الفرعي',
      minWidth: '110px',
      className: 'num-mono',
      render: s => `${parseFloat(s.subtotal).toFixed(2)} ج.م`
    },
    {
      key: 'discount_amount',
      label: 'الخصم',
      minWidth: '90px',
      align: 'center',
      className: 'num-mono',
      render: s => (
        <span style={{ color: parseFloat(s.discount_amount) > 0 ? '#b71c1c' : 'inherit' }}>
          {parseFloat(s.discount_amount) > 0 ? `-${s.discount_amount}` : '-'}
        </span>
      )
    },
    {
      key: 'grand_total',
      label: 'الإجمالي النهائي',
      minWidth: '120px',
      className: 'num-mono',
      render: s => (
        <span style={{ fontWeight: 800, color: '#15803d' }}>
          {parseFloat(s.grand_total).toFixed(2)} ج.م
        </span>
      )
    },
    {
      key: 'payment_method',
      label: 'طريقة السداد',
      minWidth: '100px',
      align: 'center',
      render: s => (
        <span className="badge badge-navy">
          {s.payment_method === 'cash' && 'نقدي'}
          {s.payment_method === 'visa' && 'فيزا'}
          {s.payment_method === 'credit' && 'آجل'}
          {s.payment_method === 'mixed' && 'مركب'}
          {s.payment_method === 'wallet' && 'محفظة'}
          {s.payment_method === 'instapay' && 'إنستاباي'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'التاريخ والوقت',
      minWidth: '140px',
      className: 'num-mono',
      render: s => <span style={{ fontSize: '11px' }}>{new Date(s.created_at).toLocaleString('ar-EG')}</span>
    },
    {
      key: 'actions',
      label: 'معاينة وطباعة',
      minWidth: '130px',
      align: 'center',
      render: s => (
        <div style={{ display: 'inline-flex', gap: '4px' }}>
          <button
            className="btn btn-sm"
            style={{ padding: '2px 6px' }}
            onClick={(e) => { e.stopPropagation(); viewSaleDetails(s.id); }}
            title="عرض الأصناف"
          >
            <Eye size={12} />
            <span>تفاصيل</span>
          </button>
          <button
            className="btn btn-sm btn-primary"
            style={{ padding: '2px 6px' }}
            onClick={async (e) => {
              e.stopPropagation();
              const full = await api.get(`/sales/${s.id}`);
              onOpenReceipt(full);
            }}
            title="طباعة الفاتورة"
          >
            <Printer size={12} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {/* Top Filter Toolbar */}
      <div
        className="pos-toolbar"
        style={{
          background: '#ffffff',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} style={{ position: 'absolute', right: '8px', color: '#64748b' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="رقم الفاتورة أو اسم العميل..."
              style={{ paddingRight: '28px', width: '210px' }}
            />
          </div>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '130px', fontSize: '12px' }}
          >
            <option value="">جميع طرق الدفع</option>
            <option value="cash">نقدي (Cash)</option>
            <option value="visa">فيزا (Visa)</option>
            <option value="credit">آجل (Credit)</option>
            <option value="mixed">مركب (Mixed)</option>
            <option value="wallet">محفظة</option>
            <option value="instapay">إنستاباي</option>
          </select>

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

          <button className="btn btn-sm" onClick={loadSales}>
            <RefreshCw size={12} />
            <span>تحديث</span>
          </button>
        </div>

        {summary && (
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
            <span>الفواتير: <strong className="num-mono">{summary.total_invoices || 0}</strong></span>
            <span>إجمالي المبيعات: <strong className="num-mono" style={{ color: '#15803d' }}>{parseFloat(summary.total_sales || 0).toFixed(2)} ج.م</strong></span>
          </div>
        )}
      </div>

      {/* Sales Table */}
      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        emptyMessage="لا توجد فواتير مبيعات مطابقة"
        rowKey={s => s.id}
      />

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '650px', maxHeight: '85vh' }}>
            <div className="modal-header">
              <span>تفاصيل الفاتورة: {selectedSale.invoice_number}</span>
              <button className="close-btn" onClick={() => setSelectedSale(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px', background: '#f8fafc', padding: '8px', borderRadius: '3px' }}>
                <div>الكاشير: <strong>{selectedSale.cashier_name}</strong></div>
                <div>العميل: <strong>{selectedSale.customer_name || 'نقدي عام'}</strong></div>
                <div>التاريخ: <span className="num-mono">{new Date(selectedSale.created_at).toLocaleString('ar-EG')}</span></div>
              </div>

              <div className="table-container" style={{ maxHeight: '280px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الصنف</th>
                      <th>الباركود</th>
                      <th>الكمية</th>
                      <th>سعر الوحدة</th>
                      <th>خصم</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((itm, i) => (
                      <tr key={itm.id}>
                        <td className="num-mono">{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{itm.product_name}</td>
                        <td className="num-mono">{itm.barcode}</td>
                        <td className="num-mono">{itm.quantity} {itm.unit}</td>
                        <td className="num-mono">{parseFloat(itm.unit_price).toFixed(2)}</td>
                        <td className="num-mono">{itm.discount_amount || '-'}</td>
                        <td className="num-mono" style={{ fontWeight: 700 }}>{parseFloat(itm.total).toFixed(2)} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '16px', fontSize: '13px' }}>
                <div>المجموع: <strong className="num-mono">{selectedSale.subtotal} ج.م</strong></div>
                <div>الخصم: <strong className="num-mono">{selectedSale.discount_amount} ج.م</strong></div>
                <div style={{ fontSize: '15px', color: '#15803d' }}>
                  الإجمالي: <strong className="num-mono">{selectedSale.grand_total} ج.م</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSale(null)}>إغلاق</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onOpenReceipt(selectedSale);
                  setSelectedSale(null);
                }}
              >
                <Printer size={14} />
                <span>طباعة الفاتورة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
