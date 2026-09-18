import React, { useState, useEffect } from 'react';
import {
  Store,
  User,
  Clock,
  Bell,
  Volume2,
  VolumeX,
  Maximize2,
  LogOut,
  AlertTriangle,
  Layers,
  CircleDot,
  KeyRound,
  Play,
  Square,
  Smartphone
} from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({
  currentUser,
  activeShift,
  onLogout,
  onOpenSwitchUser,
  soundEnabled,
  onToggleSound,
  onOpenNotifications,
  storeSettings,
  onOpenChangePassword,
  onOpenShift,
  onCloseShift,
  activeTab,
  onNavigate
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertCounts, setAlertCounts] = useState({ lowStock: 0, expired: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch alert count periodically
  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await api.get('/inventory/summary');
        setAlertCounts({
          lowStock: res.low_stock || 0,
          expired: res.expired_count || 0
        });
      } catch (e) {}
    }
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = alertCounts.lowStock + alertCounts.expired;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header
      className="no-print"
      style={{
        background: 'linear-gradient(180deg, #162433 0%, #0d1620 100%)',
        color: '#ffffff',
        borderBottom: '2px solid #243b55',
        padding: '5px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        height: '46px',
        userSelect: 'none'
      }}
    >
      {/* Right Side: Store Name & Current Shift Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={20} style={{ color: '#38bdf8' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.2px' }}>
              {storeSettings?.store_name || 'سوبر ماركت'}
            </div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
              {storeSettings?.store_branch || 'الفرع الرئيسي'}
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#334155' }} />

        {/* Shift Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeShift ? '#064e3b' : '#7f1d1d',
              padding: '3px 8px',
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 600,
              border: `1px solid ${activeShift ? '#059669' : '#b91c1c'}`
            }}
          >
            <CircleDot size={10} style={{ color: activeShift ? '#34d399' : '#f87171' }} />
            <span>
              {activeShift
                ? `شيفت مفتوح #${activeShift.shift?.id || ''}`
                : 'لا يوجد شيفت نشط'}
            </span>
            {activeShift && (
              <span className="num-mono" style={{ color: '#a7f3d0', marginRight: '4px' }}>
                {activeShift.expectedCash || 0} ج.م
              </span>
            )}
          </div>

          {/* Direct Shift Action Button for Cashiers */}
          {activeShift ? (
            <button
              onClick={onCloseShift}
              className="btn btn-sm btn-danger"
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="تقفيل وإغلاق الشيفت النهائي"
            >
              <Square size={11} />
              <span>إغلاق الشيفت</span>
            </button>
          ) : (
            <button
              onClick={onOpenShift}
              className="btn btn-sm btn-success"
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="فتح شيفت كاشير جديد"
            >
              <Play size={11} />
              <span>فتح شيفت</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle: Live Clock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0f172a',
          padding: '2px 10px',
          borderRadius: '2px',
          border: '1px solid #1e293b',
          fontSize: '11.5px',
          color: '#cbd5e1'
        }}
      >
        <Clock size={13} style={{ color: '#38bdf8' }} />
        <span>
          {currentTime.toLocaleDateString('ar-EG', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
        <span className="num-mono" style={{ color: '#38bdf8', fontWeight: 700 }}>
          {currentTime.toLocaleTimeString('en-US', { hour12: true })}
        </span>
      </div>

      {/* Left Side: Actions, User Badge, Sound, Demo Switcher, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Mobile Portal Shortcut for Admin */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'manager') && onNavigate && (
          <button
            onClick={() => onNavigate(activeTab === 'admin_mobile' ? 'dashboard' : 'admin_mobile')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'admin_mobile' ? '#0284c7' : '#1e293b',
              color: activeTab === 'admin_mobile' ? '#ffffff' : '#38bdf8',
              borderColor: activeTab === 'admin_mobile' ? '#38bdf8' : '#334155',
              fontSize: '11.5px',
              padding: '3px 8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
            title="بوابة الإدارة للموبايل"
          >
            <Smartphone size={13} />
            <span>شاشة الموبايل</span>
          </button>
        )}

        {/* Switch User Button (Requires Password) */}
        <button
          onClick={onOpenSwitchUser}
          className="btn btn-sm"
          style={{
            background: '#1e293b',
            color: '#38bdf8',
            borderColor: '#334155',
            fontSize: '11.5px',
            padding: '3px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="تبديل الحساب (يتطلب كلمة المرور)"
        >
          <Layers size={13} />
          <span>تبديل الحساب</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="btn btn-sm"
          style={{
            background: totalAlerts > 0 ? '#451a03' : '#1e293b',
            borderColor: totalAlerts > 0 ? '#b45309' : '#334155',
            color: totalAlerts > 0 ? '#f59e0b' : '#cbd5e1',
            position: 'relative'
          }}
          title="التنبيهات والملاحظات"
        >
          <Bell size={13} />
          {totalAlerts > 0 && (
            <span
              style={{
                background: '#dc2626',
                color: '#fff',
                borderRadius: '50%',
                padding: '1px 5px',
                fontSize: '10px',
                fontWeight: 800,
                marginRight: '3px'
              }}
            >
              {totalAlerts}
            </span>
          )}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="btn btn-sm"
          style={{
            background: '#1e293b',
            borderColor: '#334155',
            color: soundEnabled ? '#34d399' : '#94a3b8'
          }}
          title={soundEnabled ? 'كتم صوت الباركود' : 'تشغيل صوت الباركود'}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="btn btn-sm"
          style={{ background: '#1e293b', borderColor: '#334155', color: '#cbd5e1' }}
          title="ملء الشاشة"
        >
          <Maximize2 size={13} />
        </button>

        {/* User Info Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1e293b',
            border: '1px solid #334155',
            padding: '3px 8px',
            borderRadius: '2px',
            fontSize: '11.5px'
          }}
        >
          <User size={13} style={{ color: '#38bdf8' }} />
          <span style={{ fontWeight: 700 }}>{currentUser?.full_name}</span>
          <span
            style={{
              fontSize: '10px',
              background: '#0f172a',
              color: '#38bdf8',
              padding: '1px 5px',
              borderRadius: '2px',
              border: '1px solid #475569'
            }}
          >
            {currentUser?.role_display}
          </span>
        </div>

        {/* Change Password Button */}
        <button
          onClick={onOpenChangePassword}
          className="btn btn-sm"
          style={{
            background: '#1e293b',
            borderColor: '#334155',
            color: '#38bdf8',
            fontSize: '11.5px',
            padding: '3px 8px'
          }}
          title="تغيير كلمة المرور الخاصة بك"
        >
          <KeyRound size={13} />
          <span>تغيير كلمة المرور</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="btn btn-sm btn-danger"
          style={{ fontSize: '11.5px' }}
          title="تسجيل الخروج"
        >
          <LogOut size={13} />
          <span>خروج</span>
        </button>
      </div>
    </header>
  );
}
