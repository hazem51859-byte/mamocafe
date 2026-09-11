import React, { useState, useEffect } from 'react';
import {
  Coins,
  Play,
  Square,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Printer,
  RefreshCw,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function ShiftsView({ onShiftChange }) {
  const [activeShiftData, setActiveShiftData] = useState(null);
  const [shiftsHistory, setShiftsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState('1000');
  const [openingNotes, setOpeningNotes] = useState('');

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const [showCashTxModal, setShowCashTxModal] = useState(false);
  const [txType, setTxType] = useState('in'); // 'in', 'out'
  const [txAmount, setTxAmount] = useState('');
  const [txReason, setTxReason] = useState('');

  const [selectedReport, setSelectedReport] = useState(null);

  const loadActiveShift = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shifts/active');
      setActiveShiftData(res.hasActiveShift ? res.metrics : null);
      if (onShiftChange) onShiftChange(res.hasActiveShift ? res.metrics : null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.get('/shifts');
      setShiftsHistory(res || []);
    } catch (e) {}
  };

  useEffect(() => {
    loadActiveShift();
    loadHistory();
  }, []);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shifts/open', {
        openingCash: openingCashInput,
        notes: openingNotes
      });
      alert('تم فتح الشيفت بنجاح');
      setShowOpenModal(false);
      loadActiveShift();
      loadHistory();
    } catch (err) {
      alert(err.message || 'فشل فتح الشيفت');
    }
  };

  const handleCashTx = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shifts/cash-transaction', {
        type: txType,
        amount: txAmount,
        reason: txReason
      });
      alert('تم تسجيل الحركة النقدية في الدرج بنجاح');
      setShowCashTxModal(false);
      setTxAmount('');
      setTxReason('');
      loadActiveShift();
    } catch (err) {
      alert(err.message || 'فشل تسجيل الحركة النقدية');
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/shifts/close', {
        actualCash: actualCashInput,
        notes: closingNotes
      });
      alert('تم إغلاق الشيفت بنجاح وحساب العجز والزيادة');
      setShowCloseModal(false);
      setSelectedReport(res.metrics);
      loadActiveShift();
      loadHistory();
    } catch (err) {
      alert(err.message || 'فشل إغلاق الشيفت');
    }
  };

  const viewZReport = async (shiftId) => {
    try {
      const res = await api.get(`/shifts/${shiftId}/report`);
      setSelectedReport(res);
    } catch (e) {
      alert('فشل تحميل تقرير التقفيل');
    }
  };

  const s = activeShiftData?.shift;
  const sales = activeShiftData?.sales || {};
  const ret = activeShiftData?.returns || {};
  const exp = activeShiftData?.expenses || {};
  const ctx = activeShiftData?.cashTransactions || {};
  const expected = activeShiftData?.expectedCash || 0;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {/* Top Header */}
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
          <Coins size={18} style={{ color: '#234e70' }} />
          <h2 style={{ fontSize: '15px' }}>إدارة الخزينة وحركات الدرج والشيفتات</h2>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={() => { loadActiveShift(); loadHistory(); }}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>
          {!activeShiftData ? (
            <button className="btn btn-sm btn-success" onClick={() => setShowOpenModal(true)}>
              <Play size={13} />
              <span>فتح شيفت كاشير جديد</span>
            </button>
          ) : (
            <>
              <button
                className="btn btn-sm"
                onClick={() => {
                  setTxType('in');
                  setShowCashTxModal(true);
                }}
              >
                <ArrowDownToLine size={13} />
                <span>إيداع درج (Cash In)</span>
              </button>
              <button
                className="btn btn-sm"
                onClick={() => {
                  setTxType('out');
                  setShowCashTxModal(true);
                }}
              >
                <ArrowUpFromLine size={13} />
                <span>سحب من الدرج (Cash Out)</span>
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  setActualCashInput(expected.toString());
                  setShowCloseModal(true);
                }}
              >
                <Square size={13} />
                <span>تقفيل وإغلاق الشيفت (Z-Report)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Active Shift Panel (Top) & History Table (Bottom) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
        {/* Active Shift Panel */}
        {activeShiftData ? (
          <div className="pos-panel" style={{ borderTop: '3px solid #162433' }}>
            <div className="pos-panel-header" style={{ background: '#f1f5f9' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span>الشيفت الحالي: <strong className="num-mono">#{s.id}</strong></span>
                <span>الكاشير: <strong>{s.cashier_name}</strong></span>
                <span>وقت الفتح: <span className="num-mono">{new Date(s.start_time).toLocaleTimeString('ar-EG')}</span></span>
              </div>
              <span className="badge badge-success">شيفت مفتوح ونشط حالياً</span>
            </div>

            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>العهدة الافتتاحية:</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800 }}>
                  {parseFloat(s.opening_cash).toFixed(2)} ج.م
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>مبيعات كاش بالدرج:</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#15803d' }}>
                  +{parseFloat(sales.total_cash_sales || 0).toFixed(2)} ج.م
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>{sales.total_invoices || 0} فاتورة</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>مرتجعات كاش من الدرج:</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#b71c1c' }}>
                  -{parseFloat(ret.cash_refund || 0).toFixed(2)} ج.م
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>مصروفات مخصومة:</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#b71c1c' }}>
                  -{parseFloat(exp.total_expenses_amount || 0).toFixed(2)} ج.م
                </div>
              </div>

              {/* Expected Drawer Cash */}
              <div style={{ background: '#0f172a', color: '#38bdf8', padding: '8px 12px', borderRadius: '3px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>النقدية المفترضة بالدرج:</div>
                <div className="num-mono" style={{ fontSize: '20px', fontWeight: 900 }}>
                  {expected.toFixed(2)} ج.م
                </div>
              </div>
            </div>

            {/* Other Payment Methods inside Shift */}
            <div style={{ padding: '0 12px 10px', display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
              <span>مبيعات فيزا وبطاقات: <strong className="num-mono">{parseFloat(sales.card_sales || 0).toFixed(2)} ج.م</strong></span>
              <span>مبيعات إلكترونية (إنستاباي/محافظ): <strong className="num-mono">{parseFloat(sales.digital_sales || 0).toFixed(2)} ج.م</strong></span>
              <span>مبيعات آجلة: <strong className="num-mono">{parseFloat(sales.credit_sales || 0).toFixed(2)} ج.م</strong></span>
            </div>
          </div>
        ) : (
          <div
            className="pos-panel"
            style={{
              padding: '24px',
              textAlign: 'center',
              background: '#fef2f2',
              border: '1px solid #f87171'
            }}
          >
            <AlertTriangle size={32} style={{ color: '#b91c1c', margin: '0 auto 8px', display: 'block' }} />
            <h3 style={{ fontSize: '16px', color: '#991b1b', marginBottom: '4px' }}>
              لا يوجد شيفت كاشير مفتوح حالياً
            </h3>
            <p style={{ fontSize: '12.5px', color: '#7f1d1d', marginBottom: '12px' }}>
              يجب فتح شيفت كاشير وتحديد العهدة الافتتاحية لبدء تسجيل حركات البيع والنقدية بشكل منظم
            </p>
            <button className="btn btn-primary" onClick={() => setShowOpenModal(true)}>
              <Play size={14} />
              <span>فتح شيفت الآن بعهدة نقدية</span>
            </button>
          </div>
        )}

        {/* Shifts History Table */}
        <div className="pos-panel" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="pos-panel-header">
            <span>سجل الشيفتات السابقة وإغلاقات الكاشير</span>
          </div>

          <div className="table-container" style={{ flex: 1 }}>
            <table className="dense-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '85px', textAlign: 'center' }}>رقم الشيفت</th>
                  <th style={{ minWidth: '140px' }}>الكاشير</th>
                  <th style={{ minWidth: '135px' }}>وقت البدء</th>
                  <th style={{ minWidth: '135px' }}>وقت الإغلاق</th>
                  <th style={{ minWidth: '120px' }}>العهدة الافتتاحية</th>
                  <th style={{ minWidth: '120px' }}>المتوقع بالدرج</th>
                  <th style={{ minWidth: '120px' }}>الفعلي المحسوب</th>
                  <th style={{ minWidth: '140px' }}>الفارق (عجز / زيادة)</th>
                  <th style={{ minWidth: '90px', textAlign: 'center' }}>الحالة</th>
                  <th style={{ minWidth: '160px', textAlign: 'center' }}>تقرير التقفيل Z-Report</th>
                </tr>
              </thead>
              <tbody>
                {shiftsHistory.map(shift => (
                  <tr key={shift.id}>
                    <td className="num-mono" style={{ fontWeight: 800 }}>#{shift.id}</td>
                    <td style={{ fontWeight: 600 }}>{shift.cashier_name}</td>
                    <td className="num-mono" style={{ fontSize: '11px' }}>
                      {new Date(shift.start_time).toLocaleString('ar-EG')}
                    </td>
                    <td className="num-mono" style={{ fontSize: '11px' }}>
                      {shift.end_time ? new Date(shift.end_time).toLocaleString('ar-EG') : 'قيد التشغيل'}
                    </td>
                    <td className="num-mono">{parseFloat(shift.opening_cash).toFixed(2)} ج.م</td>
                    <td className="num-mono">
                      {shift.status === 'closed' ? `${parseFloat(shift.closing_cash_expected).toFixed(2)} ج.م` : '-'}
                    </td>
                    <td className="num-mono" style={{ fontWeight: 700 }}>
                      {shift.status === 'closed' ? `${parseFloat(shift.closing_cash_actual).toFixed(2)} ج.م` : '-'}
                    </td>
                    <td className="num-mono" style={{ fontWeight: 800, color: shift.difference < 0 ? '#b71c1c' : shift.difference > 0 ? '#15803d' : '#475569' }}>
                      {shift.status === 'closed' ? (
                        shift.difference === 0 ? 'مطابق تماماً' : `${shift.difference > 0 ? '+' : ''}${parseFloat(shift.difference).toFixed(2)} ج.م`
                      ) : '-'}
                    </td>
                    <td>
                      {shift.status === 'open' ? (
                        <span className="badge badge-warning">مفتوح</span>
                      ) : (
                        <span className="badge badge-success">مغلق</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '2px 8px' }}
                        onClick={() => viewZReport(shift.id)}
                      >
                        <FileText size={12} />
                        <span>عرض التقرير</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* 1. Open Shift Modal */}
      {showOpenModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '380px' }}>
            <div className="modal-header">
              <span>فتح شيفت كاشير جديد</span>
              <button className="close-btn" onClick={() => setShowOpenModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleOpenShift}>
              <div className="modal-body">
                <div className="form-group">
                  <label>مبلغ العهدة النقدية الافتتاحية (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات افتتاح الشيفت:</label>
                  <input
                    type="text"
                    value={openingNotes}
                    onChange={(e) => setOpeningNotes(e.target.value)}
                    placeholder="مثال: شيفت الصباح، عهدة فكة..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOpenModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-success">تأكيد فتح الشيفت</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Cash In / Out Modal */}
      {showCashTxModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <span>{txType === 'in' ? 'إيداع نقدية في الدرج (Cash In)' : 'سحب نقدية من الدرج (Cash Out)'}</span>
              <button className="close-btn" onClick={() => setShowCashTxModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCashTx}>
              <div className="modal-body">
                <div className="form-group">
                  <label>المبلغ (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
                  />
                </div>

                <div className="form-group">
                  <label>السبب والبيان (*):</label>
                  <input
                    type="text"
                    required
                    value={txReason}
                    onChange={(e) => setTxReason(e.target.value)}
                    placeholder="مثال: توريد فكة إضافية، سحب أمانات للخزينة الرئيسية..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCashTxModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">تأكيد الحركة النقدية</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Close Shift Modal (Z-Report) */}
      {showCloseModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '460px' }}>
            <div className="modal-header">
              <span>تقفيل وإغلاق الشيفت النهائي (Z-Report)</span>
              <button className="close-btn" onClick={() => setShowCloseModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCloseShift}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '3px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>العهدة الافتتاحية:</span>
                    <strong className="num-mono">{parseFloat(s.opening_cash).toFixed(2)} ج.م</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>مبيعات كاش صافية:</span>
                    <strong className="num-mono" style={{ color: '#15803d' }}>+{parseFloat(sales.total_cash_sales || 0).toFixed(2)} ج.م</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>مرتجعات كاش ومصروفات:</span>
                    <strong className="num-mono" style={{ color: '#b71c1c' }}>
                      -{(parseFloat(ret.cash_refund || 0) + parseFloat(exp.total_expenses_amount || 0)).toFixed(2)} ج.م
                    </strong>
                  </div>
                  <div style={{ borderTop: '1px dashed #94a3b8', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>النقدية المتوقعة بالدرج:</span>
                    <span className="num-mono" style={{ color: '#234e70', fontSize: '16px' }}>{expected.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>النقدية الفعلية المحسوبة بعد الجرد (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    style={{ fontSize: '22px', fontWeight: 900, textAlign: 'center', padding: '8px' }}
                  />

                  {actualCashInput && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '3px',
                        background: parseFloat(actualCashInput) - expected === 0 ? '#dcfce7' : '#fee2e2',
                        color: parseFloat(actualCashInput) - expected === 0 ? '#15803d' : '#b91c1c',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700
                      }}
                    >
                      <span>الفارق (عجز أو زيادة):</span>
                      <span className="num-mono" style={{ fontSize: '16px' }}>
                        {(parseFloat(actualCashInput) - expected).toFixed(2)} ج.م
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>ملاحظات التقفيل:</label>
                  <input
                    type="text"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder="ملاحظات العهدة والتسليم..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-danger btn-lg">تأكيد إغلاق الشيفت وإصدار Z-Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Full Z-Report Preview Modal */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '480px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <span>تقرير تقفيل الشيفت (Shift Z-Report)</span>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ background: '#f8fafc', padding: '14px' }}>
              <div style={{ background: '#ffffff', border: '1px dashed #000', padding: '14px', fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>تقرير إغلاق الشيفت (Z-REPORT)</h3>
                  <div>شيفت رقم: #{selectedReport.shift?.id}</div>
                  <div>الكاشير: {selectedReport.shift?.cashier_name}</div>
                  <div>من: {new Date(selectedReport.shift?.start_time).toLocaleString('ar-EG')}</div>
                  <div>إلى: {selectedReport.shift?.end_time ? new Date(selectedReport.shift?.end_time).toLocaleString('ar-EG') : 'الآن'}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>العهدة الافتتاحية:</span>
                  <strong>{parseFloat(selectedReport.shift?.opening_cash).toFixed(2)} ج.م</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>مبيعات نقدي (كاش):</span>
                  <strong>+{parseFloat(selectedReport.sales?.total_cash_sales || 0).toFixed(2)} ج.م</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>مبيعات فيزا وبطاقات:</span>
                  <strong>{parseFloat(selectedReport.sales?.card_sales || 0).toFixed(2)} ج.م</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>مرتجعات كاش:</span>
                  <strong>-{parseFloat(selectedReport.returns?.cash_refund || 0).toFixed(2)} ج.م</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>مصروفات ونثريات:</span>
                  <strong>-{parseFloat(selectedReport.expenses?.total_expenses_amount || 0).toFixed(2)} ج.م</strong>
                </div>

                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                  <span>النقدية المتوقعة بالدرج:</span>
                  <span>{parseFloat(selectedReport.expectedCash || selectedReport.shift?.closing_cash_expected || 0).toFixed(2)} ج.م</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                  <span>النقدية الفعلية المحسوبة:</span>
                  <span>{parseFloat(selectedReport.shift?.closing_cash_actual || selectedReport.expectedCash || 0).toFixed(2)} ج.م</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, marginTop: '4px' }}>
                  <span>الفارق (عجز / زيادة):</span>
                  <span style={{ color: selectedReport.shift?.difference < 0 ? '#b71c1c' : '#15803d' }}>
                    {parseFloat(selectedReport.shift?.difference || 0).toFixed(2)} ج.م
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedReport(null)}>إغلاق</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={14} />
                <span>طباعة التقرير</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
