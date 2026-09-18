import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Copy, Check, KeyRound, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function ActivationView({ onActivationSuccess }) {
  const [machineId, setMachineId] = useState('جاري القراءة...');
  const [licenseKey, setLicenseKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/license/status')
      .then(res => {
        if (res.machineId) setMachineId(res.machineId);
        if (res.isActivated) {
          onActivationSuccess();
        }
      })
      .catch(() => {
        api.get('/license/machine-id')
          .then(res => { if (res.machineId) setMachineId(res.machineId); })
          .catch(() => setMachineId('تعذر قراءة كود الجهاز'));
      });
  }, [onActivationSuccess]);

  const handleCopyMachineId = () => {
    if (!machineId || machineId.includes('جاري')) return;
    navigator.clipboard.writeText(machineId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setError('يرجى كتابة أو لصق مفتاح التفعيل أولاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/license/activate', { licenseKey: licenseKey.trim() });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onActivationSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'مفتاح التفعيل غير صحيح أو غير متوافق مع كود هذا الجهاز');
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
        width: '100%',
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(30, 58, 138, 0.45), transparent 75%), linear-gradient(180deg, #111e33 0%, #080d17 100%)',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '520px',
          maxWidth: '95vw',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(15, 23, 42, 0.6)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(180deg, #162433 0%, #0d1620 100%)',
            color: '#ffffff',
            padding: '22px 20px',
            textAlign: 'center',
            borderBottom: '2px solid #243b55'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              background: '#243b55',
              borderRadius: '8px',
              marginBottom: '10px',
              color: '#38bdf8',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            تفعيل وترخيص نظام ZoTech POS
          </h2>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            البرنامج محمي ومقفل بالماك أدرس الخاص بهذا الجهاز (Hardware-Locked License)
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{ color: '#15803d', display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <Sparkles size={48} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#15803d', marginBottom: '6px' }}>
                تم تفعيل وترخيص النظام بنجاح!
              </h3>
              <p style={{ fontSize: '13px', color: '#475569' }}>
                تم تثبيت الترخيص الدائم لهذا الجهاز بنجاح. جاري نقلك لشاشة تسجيل الدخول...
              </p>
            </div>
          ) : (
            <form onSubmit={handleActivate}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: '#fee2e2',
                    border: '1px solid #ef4444',
                    color: '#b91c1c',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    marginBottom: '16px'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Machine ID Box */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  كود تعريف هذا الجهاز (Machine ID):
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '2px dashed #94a3b8',
                    borderRadius: '5px',
                    padding: '8px 12px',
                    justifyContent: 'space-between'
                  }}
                >
                  <span className="num-mono" style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', letterSpacing: '1px' }}>
                    {machineId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMachineId}
                    className={`btn btn-sm ${copied ? 'btn-success' : 'btn-secondary'}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', fontSize: '12px' }}
                    title="نسخ كود الجهاز"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  * هذا الكود مشتق من الماك أدرس (MAC Address) لبطاقة الشبكة الخاصة بهذا الجهاز.
                </div>
              </div>

              {/* Instructions & WhatsApp Contact */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '5px',
                  padding: '12px 14px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontSize: '12px', color: '#166534', fontWeight: 700, marginBottom: '6px' }}>
                  للحصول على مفتاح التفعيل الخاص بك:
                </div>
                <div style={{ fontSize: '11.5px', color: '#14532d', marginBottom: '10px', lineHeight: '1.5' }}>
                  انسخ كود الجهاز أعلاه وأرسله للدعم الفني لشركة ZoTech لاستلام مفتاح التفعيل الدائم مدى الحياة:
                </div>
                <a
                  href={`https://wa.me/201275984405?text=${encodeURIComponent(`السلام عليكم، أرغب في تفعيل نظام كاشير ZoTech POS على هذا الجهاز:\nكود الجهاز: ${machineId}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-success"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  <MessageSquare size={14} />
                  <span>إرسال كود الجهاز عبر واتساب (01275984405)</span>
                </a>
              </div>

              {/* License Key Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  <KeyRound size={15} style={{ color: '#234e70' }} />
                  <span>أدخل مفتاح التفعيل (License Key):</span>
                </label>
                <input
                  type="text"
                  required
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="num-mono"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    textAlign: 'center',
                    border: '2px solid #cbd5e1',
                    borderRadius: '4px'
                  }}
                />
              </div>

              {/* Activate Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', padding: '11px', fontSize: '14.5px', fontWeight: 800 }}
              >
                <Lock size={16} />
                <span>{loading ? 'جاري التحقق من الترخيص...' : 'تفعيل النظام الآن'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '10px 18px',
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
