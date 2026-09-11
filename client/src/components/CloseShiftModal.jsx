import React, { useState, useEffect } from 'react';
import { Square, Coins, X, AlertCircle, Check, Printer } from 'lucide-react';
import { api } from '../services/api';

export default function CloseShiftModal({ activeShift, onShiftClosed, onClose }) {
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [freshMetrics, setFreshMetrics] = useState(activeShift);

  // Load freshest metrics on modal open
  useEffect(() => {
    async function loadFresh() {
      try {
        const res = await api.get('/shifts/active');
        if (res.hasActiveShift) {
          setFreshMetrics(res.metrics);
        }
      } catch (e) {}
    }
    loadFresh();
  }, []);

  const shift = freshMetrics?.shift || {};
  const sales = freshMetrics?.sales || {};
  const ret = freshMetrics?.returns || {};
  const exp = freshMetrics?.expenses || {};
  const expected = parseFloat(freshMetrics?.expectedCash || 0);

  const actualVal = parseFloat(actualCash) || 0;
  const hasEnteredActual = actualCash.trim() !== '';
  const difference = hasEnteredActual ? actualVal - expected : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isNaN(parseFloat(actualCash)) || parseFloat(actualCash) < 0) {
      setError('يرجى إدخال مبلغ النقدية الفعلي المحسوب في الدرج');
      return;
    }

    if (!window.confirm('هل أنت متأكد من إغلاق وتقفيل الشيفت وتسليم عهدة الدرج؟')) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/shifts/close', {
        shiftId: shift.id,
        actualCash: parseFloat(actualCash),
        notes
      });

      if (onShiftClosed) onShiftClosed(res.metrics);
      onClose();
    } catch (err) {
      setError(err.message || 'فشل إغلاق الشيفت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ width: '480px' }}>
        <div className="modal-header" style={{ background: '#1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Square size={18} style={{ color: '#f87171' }} />
            <span>تقفيل وإغلاق الشيفت النهائي #{shift.id || ''}</span>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  padding: '8px 10px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px'
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Shift Real-time Summary Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '14px',
                fontSize: '12.5px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>الكاشير المسؤول:</span>
                <strong>{shift.cashier_name || 'الكاشير'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>العهدة النقدية الافتتاحية:</span>
                <strong className="num-mono">{parseFloat(shift.opening_cash || 0).toFixed(2)} ج.م</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>مبيعات كاش محصلة (+):</span>
                <strong className="num-mono" style={{ color: '#15803d' }}>
                  +{parseFloat(sales.total_cash_sales || 0).toFixed(2)} ج.م
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>مرتجعات كاش ومصروفات (-):</span>
                <strong className="num-mono" style={{ color: '#b91c1c' }}>
                  -{(parseFloat(ret.cash_refund || 0) + parseFloat(exp.total_expenses_amount || 0)).toFixed(2)} ج.م
                </strong>
              </div>

              <div
                style={{
                  borderTop: '2px solid #cbd5e1',
                  paddingTop: '8px',
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>النقدية المتوقعة في الدرج:</strong>
                <span className="num-mono" style={{ fontSize: '18px', fontWeight: 900, color: '#0284c7' }}>
                  {expected.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            {/* Actual cash count input */}
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700 }}>
                النقدية الفعلية المحسوبة في الدرج (ج.م) (*):
              </label>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="0.00"
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  textAlign: 'center',
                  padding: '8px',
                  borderColor: hasEnteredActual
                    ? difference < 0
                      ? '#ef4444'
                      : difference > 0
                      ? '#3b82f6'
                      : '#10b981'
                    : '#cbd5e1'
                }}
              />
            </div>

            {/* Live Difference / Discrepancy indicator */}
            {hasEnteredActual && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: 800,
                  background:
                    difference < 0
                      ? '#fef2f2'
                      : difference > 0
                      ? '#eff6ff'
                      : '#f0fdf4',
                  border: `1px solid ${
                    difference < 0
                      ? '#fca5a5'
                      : difference > 0
                      ? '#93c5fd'
                      : '#86efac'
                  }`,
                  color:
                    difference < 0
                      ? '#b91c1c'
                      : difference > 0
                      ? '#1d4ed8'
                      : '#15803d'
                }}
              >
                <span>حالة المطابقة:</span>
                <span className="num-mono" style={{ fontSize: '15px' }}>
                  {difference === 0
                    ? 'مطابق تماماً (لا يوجد عجز أو زيادة)'
                    : difference < 0
                    ? `عجز في الدرج: ${difference.toFixed(2)} ج.م`
                    : `زيادة في الدرج: +${difference.toFixed(2)} ج.م`}
                </span>
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label>ملاحظات إغلاق الشيفت:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات تخص الجرد، سبب العجز أو الزيادة إن وجد..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              <Square size={13} />
              <span>{loading ? 'جاري الإغلاق...' : 'تأكيد تقفيل الشيفت وتسليم الدرج'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
