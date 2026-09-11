import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ChangePasswordModal({ currentUser, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 4) {
      setError('يجب ألا تقل كلمة المرور الجديدة عن 4 خانات');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'فشل تغيير كلمة المرور، تأكد من صحة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ width: '420px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} style={{ color: '#38bdf8' }} />
            <span>تغيير كلمة المرور ({currentUser?.full_name || currentUser?.username})</span>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}
            >
              <Check size={26} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
              تم تغيير كلمة المرور بنجاح!
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              يمكنك الآن استخدام كلمة المرور الجديدة في المرات القادمة.
            </p>
          </div>
        ) : (
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

              {/* Current Password */}
              <div className="form-group">
                <label>كلمة المرور الحالية (*):</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                    style={{ width: '100%', paddingLeft: '32px' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      left: '6px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: 'none'
                    }}
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label>كلمة المرور الجديدة (*):</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="كلمة مرور جديدة (4 خانات على الأقل)"
                    style={{ width: '100%', paddingLeft: '32px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      left: '6px',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: 'none'
                    }}
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label>تأكيد كلمة المرور الجديدة (*):</label>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  style={{ width: '100%' }}
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
                className="btn btn-primary"
                disabled={loading}
              >
                <KeyRound size={13} />
                <span>{loading ? 'جاري الحفظ...' : 'تحديث كلمة المرور'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
