import React, { useState } from 'react';
import { Layers, User, Lock, Eye, EyeOff, X, AlertCircle, Check } from 'lucide-react';
import { api, setToken, setStoredUser } from '../services/api';

export default function SwitchUserModal({ currentUser, onSwitchSuccess, onClose }) {
  const usersList = [
    { username: 'admin', name: 'المدير العام', role: 'Super Admin' },
    { username: 'cashier1', name: 'أحمد محمود رضوان', role: 'كاشير (صباحي)' },
    { username: 'cashier2', name: 'سارة علي حسن', role: 'كاشير (مسائي)' },
    { username: 'manager', name: 'حسام الدين فؤاد', role: 'مدير الصالة والفرع' },
    { username: 'accountant', name: 'كريم عبد الله السيد', role: 'محاسب مالي' },
    { username: 'inventory', name: 'محمود عادل إبراهيم', role: 'أمين المخزن' }
  ];

  const [selectedUsername, setSelectedUsername] = useState(
    usersList.find(u => u.username !== currentUser?.username)?.username || 'cashier1'
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('يرجى إدخال كلمة المرور لتأكيد التبديل');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/switch-user', {
        username: selectedUsername,
        password
      });

      setToken(res.token);
      setStoredUser(res.user);
      onSwitchSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content" style={{ width: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#38bdf8' }} />
            <span>تبديل الحساب (تسجيل دخول المستخدم)</span>
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

            {/* Current user badge */}
            <div
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '8px 12px',
                borderRadius: '3px',
                marginBottom: '12px',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>المستخدم الحالي:</span>
              <strong style={{ color: '#0f172a' }}>
                {currentUser?.full_name} ({currentUser?.role_display})
              </strong>
            </div>

            {/* Select Target User */}
            <div className="form-group">
              <label>اختر الحساب المراد التبديل إليه (*):</label>
              <select
                value={selectedUsername}
                onChange={(e) => {
                  setSelectedUsername(e.target.value);
                  setPassword('');
                  setError('');
                }}
                style={{ width: '100%', fontSize: '13px', fontWeight: 600 }}
              >
                {usersList.map(u => (
                  <option key={u.username} value={u.username} disabled={u.username === currentUser?.username}>
                    {u.name} — {u.role} {u.username === currentUser?.username ? '(الحالي)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Password input */}
            <div className="form-group">
              <label>كلمة مرور الحساب المختار (*):</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور لتأكيد التبديل"
                  style={{ width: '100%', paddingLeft: '32px', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
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
              <Layers size={13} />
              <span>{loading ? 'جاري التحقق...' : 'تأكيد التبديل وتسجيل الدخول'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
