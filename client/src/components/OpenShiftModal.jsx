import React, { useState } from 'react';
import { Play, Coins, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function OpenShiftModal({ currentUser, onShiftOpened, onClose }) {
  const [openingCash, setOpeningCash] = useState('500');
  const [notes, setNotes] = useState('شيفت كاشير جديد');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <div className="modal-content" style={{ width: '420px' }}>
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
              <div>الكاشير المسؤول: <strong>{currentUser?.full_name}</strong></div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                سيتم بدء تسجيل كافة عمليات البيع والمرتجعات والمصروفات على هذا الشيفت.
              </div>
            </div>

            <div className="form-group">
              <label>العهدة النقدية الافتتاحية في الدرج (ج.م) (*):</label>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="0.00"
                style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                مبلغ الفكة المتواجد في درج الكاشير قبل بدء البيع
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
