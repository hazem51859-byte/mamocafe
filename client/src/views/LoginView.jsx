import React, { useState } from 'react';
import { Store, Lock, User, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { api, setToken, setStoredUser } from '../services/api';

export default function LoginView({ onLoginSuccess, storeSettings }) {
  const [localSettings, setLocalSettings] = useState(storeSettings || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!storeSettings) {
      api.get('/settings').then(res => {
        if (res.settings) setLocalSettings(res.settings);
      }).catch(() => {});
    } else {
      setLocalSettings(storeSettings);
    }
  }, [storeSettings]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      setToken(res.token);
      setStoredUser(res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول، تأكد من صحة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#ffffff',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '420px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* System Header */}
        <div
          style={{
            background: 'linear-gradient(180deg, #162433 0%, #0d1620 100%)',
            color: '#ffffff',
            padding: '18px 16px',
            textAlign: 'center',
            borderBottom: '2px solid #243b55'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              background: '#243b55',
              borderRadius: '6px',
              marginBottom: '10px',
              color: '#38bdf8',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <Store size={28} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            {localSettings?.store_name || 'نظام كاشير وإدارة السوبر ماركت'}
          </h2>
          <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
            {localSettings?.store_branch ? `${localSettings.store_branch} • ZoTech POS` : 'ZoTech Supermarket Professional POS System v1.0'}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#b91c1c',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '3px',
                marginBottom: '16px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <User size={14} style={{ color: '#243b55' }} />
              <span>اسم المستخدم:</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="أدخل اسم المستخدم"
              style={{ padding: '9px 12px', fontSize: '13.5px', width: '100%' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Lock size={14} style={{ color: '#243b55' }} />
              <span>كلمة المرور:</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="أدخل كلمة المرور"
                style={{ padding: '9px 12px', paddingLeft: '38px', fontSize: '13.5px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  left: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  padding: '6px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '11px', fontSize: '14.5px' }}
          >
            <LogIn size={16} />
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول للنظام'}</span>
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '8px 16px',
            fontSize: '11px',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>تطوير وإشراف: <strong>ZoTech</strong></span>
          <span>واتساب: <strong className="num-mono">01275984405</strong></span>
        </div>
      </div>
    </div>
  );
}
