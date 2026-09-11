import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ReturnsView() {
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'history'
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [refundMethod, setRefundMethod] = useState('cash');
  const [returnReason, setReturnReason] = useState('طلب العميل');
  const [loading, setLoading] = useState(false);
  const [returnsHistory, setReturnsHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/returns');
      setReturnsHistory(res || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleLookup = async (e) => {
    e?.preventDefault();
    if (!invoiceQuery.trim()) return;
    try {
      setLoading(true);
      const res = await api.get(`/returns/invoice-lookup/${invoiceQuery.trim()}`);
      setInvoiceData(res);
      // Initialize return items map
      const initMap = {};
      (res.items || []).forEach(item => {
        initMap[item.id] = {
          productId: item.product_id,
          name: item.product_name,
          unitPrice: item.unit_price,
          quantity: 0,
          maxQty: item.available_to_return,
          reason: 'طلب العميل'
        };
      });
      setReturnItems(initMap);
    } catch (err) {
      alert(err.message || 'لم يتم العثور على الفاتورة');
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnQtyChange = (itemId, qty) => {
    const parsed = Math.max(0, parseFloat(qty) || 0);
    setReturnItems(prev => {
      const copy = { ...prev };
      if (copy[itemId]) {
        copy[itemId].quantity = Math.min(parsed, copy[itemId].maxQty);
      }
      return copy;
    });
  };

  const totalRefund = Object.values(returnItems).reduce((acc, itm) => {
    return acc + (itm.quantity * itm.unitPrice);
  }, 0);

  const handleSubmitReturn = async () => {
    const itemsToSubmit = Object.values(returnItems).filter(i => i.quantity > 0);
    if (itemsToSubmit.length === 0) {
      alert('يرجى تحديد كمية موجبة لأحد الأصناف لإرجاعها');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من تسجيل المرتجع بقيمة ${totalRefund.toFixed(2)} ج.م وإعادة الأصناف للمخزن؟`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/returns', {
        saleId: invoiceData.id,
        invoiceNumber: invoiceData.invoice_number,
        items: itemsToSubmit,
        refundMethod,
        reason: returnReason
      });

      alert(res.message || 'تم تسجيل المرتجع بنجاح');
      setInvoiceData(null);
      setInvoiceQuery('');
      setReturnItems({});
      loadHistory();
      setActiveTab('history');
    } catch (err) {
      alert(err.message || 'فشل معالجة المرتجع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {/* Top Tabs */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RotateCcw size={18} style={{ color: '#b71c1c' }} />
          <h2 style={{ fontSize: '15px' }}>إدارة مرتجعات المبيعات</h2>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'new' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            تسجيل مرتجع جديد
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            سجل المرتجعات السابقة
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Lookup Input */}
          <div className="pos-panel" style={{ padding: '12px' }}>
            <form onSubmit={handleLookup} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>ادخل رقم الفاتورة:</div>
              <input
                type="text"
                value={invoiceQuery}
                onChange={(e) => setInvoiceQuery(e.target.value)}
                placeholder="مثال: INV-1001 أو INV-260911-0001"
                className="num-mono"
                style={{ width: '280px', padding: '6px 10px', fontSize: '14px', fontWeight: 700 }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Search size={14} />
                <span>{loading ? 'جاري البحث...' : 'بحث وجلب الفاتورة'}</span>
              </button>
            </form>
          </div>

          {/* Invoice Items & Return Setup */}
          {invoiceData && (
            <div className="pos-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="pos-panel-header">
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <span>فاتورة: <strong className="num-mono">{invoiceData.invoice_number}</strong></span>
                  <span>الكاشير: <strong>{invoiceData.cashier_name}</strong></span>
                  <span>العميل: <strong>{invoiceData.customer_name || 'نقدي عام'}</strong></span>
                </div>
                <div className="num-mono" style={{ color: '#15803d', fontWeight: 800 }}>
                  إجمالي الفاتورة: {invoiceData.grand_total} ج.م
                </div>
              </div>

              <div className="table-container" style={{ flex: 1 }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>الصنف</th>
                      <th>الكمية المباعة</th>
                      <th>المتاح للإرجاع</th>
                      <th>سعر الوحدة</th>
                      <th style={{ width: '130px', textAlign: 'center' }}>الكمية المرتجعة</th>
                      <th>إجمالي الرد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items?.map((item, idx) => {
                      const cur = returnItems[item.id] || { quantity: 0 };
                      const lineRefund = cur.quantity * item.unit_price;

                      return (
                        <tr key={item.id} style={{ background: cur.quantity > 0 ? '#fee2e2' : 'inherit' }}>
                          <td className="num-mono">{idx + 1}</td>
                          <td style={{ fontWeight: 700 }}>{item.product_name}</td>
                          <td className="num-mono">{item.quantity} {item.unit}</td>
                          <td className="num-mono" style={{ fontWeight: 700 }}>
                            {item.available_to_return} {item.unit}
                          </td>
                          <td className="num-mono">{parseFloat(item.unit_price).toFixed(2)} ج.م</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              max={item.available_to_return}
                              step="any"
                              value={cur.quantity}
                              onChange={(e) => handleReturnQtyChange(item.id, e.target.value)}
                              style={{ width: '80px', textAlign: 'center', fontWeight: 800 }}
                            />
                          </td>
                          <td className="num-mono" style={{ fontWeight: 800, color: '#b71c1c' }}>
                            {lineRefund.toFixed(2)} ج.م
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Return Actions */}
              <div
                style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderTop: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontWeight: 700, fontSize: '12.5px' }}>طريقة رد المبلغ:</label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                    >
                      <option value="cash">نقداً من الدرج (Cash Refund)</option>
                      <option value="card">إرجاع على البطاقة (Card)</option>
                      <option value="credit">إضافة لحساب العميل الدائن (Credit)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontWeight: 700, fontSize: '12.5px' }}>سبب الإرجاع:</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    >
                      <option value="طلب العميل">طلب العميل (رغبة المشتري)</option>
                      <option value="منتج تالف أو معيب">منتج تالف أو معيب</option>
                      <option value="قرب أو انتهاء الصلاحية">قرب أو انتهاء الصلاحية</option>
                      <option value="صنف غير مطابق">صنف غير مطابق</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '14px' }}>
                    إجمالي المبلغ المرتجع: <strong className="num-mono" style={{ fontSize: '18px', color: '#b71c1c' }}>
                      {totalRefund.toFixed(2)} ج.م
                    </strong>
                  </div>

                  <button
                    className="btn btn-danger btn-lg"
                    onClick={handleSubmitReturn}
                    disabled={totalRefund <= 0 || loading}
                  >
                    <Check size={16} />
                    <span>تأكيد المرتجع وإعادة البضاعة للمخزن</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Returns History Table */
        <div className="table-container" style={{ flex: 1 }}>
          <table className="dense-table">
            <thead>
              <tr>
                <th style={{ width: '45px', minWidth: '45px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '140px' }}>رقم المرتجع</th>
                <th style={{ minWidth: '140px' }}>رقم الفاتورة الأصلية</th>
                <th style={{ minWidth: '130px' }}>الكاشير</th>
                <th style={{ minWidth: '140px' }}>العميل</th>
                <th style={{ minWidth: '120px' }}>المبلغ المردود</th>
                <th style={{ minWidth: '95px', textAlign: 'center' }}>طريقة الرد</th>
                <th style={{ minWidth: '150px' }}>سبب الإرجاع</th>
                <th style={{ minWidth: '140px' }}>التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody>
              {returnsHistory.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>لا توجد مرتجعات مسجلة</td></tr>
              ) : (
                returnsHistory.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="num-mono">{idx + 1}</td>
                    <td className="num-mono" style={{ fontWeight: 800 }}>{r.return_number}</td>
                    <td className="num-mono">{r.invoice_number || '-'}</td>
                    <td>{r.cashier_name}</td>
                    <td>{r.customer_name || 'نقدي عام'}</td>
                    <td className="num-mono" style={{ fontWeight: 800, color: '#b71c1c' }}>
                      {parseFloat(r.total_refund).toFixed(2)} ج.م
                    </td>
                    <td>
                      <span className="badge badge-navy">
                        {r.refund_method === 'cash' && 'نقدي'}
                        {r.refund_method === 'card' && 'بطاقة'}
                        {r.refund_method === 'credit' && 'رصيد عميل'}
                      </span>
                    </td>
                    <td>{r.reason || '-'}</td>
                    <td className="num-mono" style={{ fontSize: '11px' }}>
                      {new Date(r.created_at).toLocaleString('ar-EG')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
