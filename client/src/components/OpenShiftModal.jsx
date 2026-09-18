import React, { useState, useEffect } from 'react';
import { Play, Coins, X, AlertCircle, Lock } from 'lucide-react';
import { api } from '../services/api';

export default function OpenShiftModal({ currentUser, onShiftOpened, onClose }) {
  const [openingCash, setOpeningCash] = useState('1000');
  const [notes, setNotes] = useState('شيفت كاشير جديد');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isCashier = currentUser?.role === 'cashier';

  useEffect(() => {
    async function loadDefaultFloat() {
      try {
        const res = await api.get('/settings');
        if (res.settings?.default_opening_cash) {
          setOpeningCash(res.settings.default_opening_cash);
        }
      } catch (e) {}
    }
    loadDefaultFloat();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cash = parseFloat(openingCash);
    if (isNaN(cash) || cash < 0) {
      setError('يرجى إدخال مبلغ عهدة افتتاحية صحيح');
      return;
    }

    setLoading(true);
    try {
      await api.post('/shifts/open', {
        openingCash: cash,
        notes
      });

      // Fetch fresh active shift
      const shiftRes = await api.get('/shifts/active');
      if (onShiftOpened) onShiftOpened(shiftRes.hasActiveShift ? shiftRes.metrics : null);
      onClose();
    } catch (err) {
      setError(err.message || 'فشل فتح الشيفت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ width: '430px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={18} style={{ color: '#22c55e' }} />
            <span>فتح شيفت كاشير جديد</span>
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

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '8px 12px',
                borderRadius: '3px',
                marginBottom: '12px',
                fontSize: '12px'
              }}
            >
              <div>المسؤول عن الشيفت: <strong>{currentUser?.full_name}</strong> ({currentUser?.role_display || currentUser?.role})</div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                سيتم بدء تسجيل كافة عمليات البيع والمرتجعات والمصروفات على هذا الشيفت.
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ margin: 0, fontWeight: 700 }}>
                  العهدة النقدية المستلمة في الدرج (ج.م) (*):
                </label>
                {isCashier && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10.5px',
                      color: '#b45309',
                      background: '#fef3c7',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}
                  >
                    <Lock size={11} /> عهدة إجبارية من الإدارة
                  </span>
                )}
              </div>

              <input
                type="number"
                step="any"
                required
                readOnly={isCashier}
                disabled={isCashier}
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="0.00"
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  textAlign: 'center',
                  padding: '8px',
                  background: isCashier ? '#f1f5f9' : '#ffffff',
                  color: isCashier ? '#334155' : '#0f172a',
                  cursor: isCashier ? 'not-allowed' : 'text',
                  borderColor: isCashier ? '#cbd5e1' : '#2563eb'
                }}
              />
              <span style={{ fontSize: '11px', color: isCashier ? '#b45309' : '#64748b', marginTop: '4px', display: 'block' }}>
                {isCashier
                  ? '🔒 هذه العهدة الافتتاحية محددة تلقائياً من قبل الإدارة ولا يمكن تعديلها بواسطة الكاشير.'
                  : 'مبلغ الفكة المتواجد في درج الكاشير قبل بدء البيع (يمكنك تعديله كمسؤول)'}
              </span>
            </div>

            <div className="form-group">
              <label>ملاحظات أو بيان الشيفت:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: شيفت صباحي، استلام عهدة فكة..."
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
              className="btn btn-success"
              disabled={loading}
            >
              <Play size={13} />
              <span>{loading ? 'جاري فتح الشيفت...' : 'تأكيد فتح الشيفت وبدء البيع'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
