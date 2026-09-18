import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  ShieldCheck,
  CreditCard,
  Send,
  Wallet,
  Coins,
  TrendingUp,
  Receipt,
  AlertTriangle,
  RefreshCw,
  ArrowLeftRight,
  ArrowUpFromLine,
  Plus,
  Phone,
  Package,
  Clock,
  User,
  Sliders,
  DollarSign,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminMobileView({ currentUser, storeSettings }) {
  const [activeTab, setActiveTab] = useState('treasury'); // 'treasury', 'shift', 'sales', 'inventory'
  const [loading, setLoading] = useState(false);

  // Data states
  const [treasuryData, setTreasuryData] = useState(null);
  const [activeShift, setActiveShift] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);

  // Quick Action Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAccount, setWithdrawAccount] = useState('main_safe');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAccount, setDepositAccount] = useState('main_safe');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReason, setDepositReason] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'manager';

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes, dRes, pRes] = await Promise.all([
        api.get('/shifts/treasury').catch(() => null),
        api.get('/shifts/active').catch(() => null),
        api.get('/reports/dashboard').catch(() => null),
        api.get('/products', { lowStock: '1', limit: 30 }).catch(() => null)
      ]);

      if (tRes) setTreasuryData(tRes);
      if (sRes?.hasActiveShift) setActiveShift(sRes.metrics);
      else setActiveShift(null);
      if (dRes) setDashboardData(dRes);
      if (pRes) {
        setLowStockProducts(pRes.products || []);
        if (pRes.inventoryStats) setInventoryStats(pRes.inventoryStats);
      }
    } catch (e) {
      console.error('Error loading mobile admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0) return alert('يرجى إدخال مبلغ صحيح');
    setTransferLoading(true);
    try {
      const res = await api.post('/shifts/transfer-to-safe', { amount: amt, notes: transferNotes });
      alert(res.message || 'تم تحويل النقدية إلى الخزنة بنجاح');
      setShowTransferModal(false);
      setTransferAmount('');
      setTransferNotes('');
      loadAllData();
    } catch (err) {
      alert(err.message || 'فشل التحويل');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || !withdrawReason) return alert('يرجى إدخال الحساب والمبلغ والسبب');
    setWithdrawLoading(true);
    try {
      const res = await api.post('/shifts/admin-withdraw', {
        account: withdrawAccount,
        amount: amt,
        reason: withdrawReason
      });
      alert(res.message || 'تم تسجيل السحب بنجاح');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawReason('');
      loadAllData();
    } catch (err) {
      alert(err.message || 'فشل السحب');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0 || !depositReason) return alert('يرجى إدخال الحساب والمبلغ والسبب');
    setDepositLoading(true);
    try {
      const res = await api.post('/shifts/admin-deposit', {
        account: depositAccount,
        amount: amt,
        reason: depositReason
      });
      alert(res.message || 'تم تسجيل الإيداع بنجاح');
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositReason('');
      loadAllData();
    } catch (err) {
      alert(err.message || 'فشل الإيداع');
    } finally {
      setDepositLoading(false);
    }
  };

  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`;
  };

  // Access check
  if (!isAdmin) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#991b1b', background: '#fef2f2', height: '100%' }}>
        <AlertTriangle size={36} style={{ margin: '0 auto 12px' }} />
        <h3>هذه الصفحة مخصصة لمدير النظام فقط</h3>
        <p>لا تملك الصلاحية الكافية للوصول إلى لوحة الموبايل التنفيذية.</p>
      </div>
    );
  }

  const balances = treasuryData?.balances || {};
  const metrics = dashboardData?.metrics || {};
  const shift = activeShift?.shift;
  const shiftSales = activeShift?.sales || {};
  const expectedDrawer = activeShift?.expectedCash || 0;

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        boxShadow: '0 0 15px rgba(0,0,0,0.05)',
        position: 'relative'
      }}
    >
      {/* Mobile Top App Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #334155'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={16} style={{ color: '#38bdf8' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              بوابة المدير للموبايل
            </h2>
            <span style={{ fontSize: '10px', background: '#0284c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Live ⚡
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            {storeSettings?.store_name || 'ZoTech Supermarket POS'} {storeSettings?.store_branch ? `(${storeSettings.store_branch})` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={loadAllData}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Segmented Control */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '4px',
          gap: '4px'
        }}
      >
        <button
          onClick={() => setActiveTab('treasury')}
          style={{
            padding: '7px 4px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            background: activeTab === 'treasury' ? '#eff6ff' : 'transparent',
            color: activeTab === 'treasury' ? '#2563eb' : '#64748b'
          }}
        >
          <Coins size={15} />
          <span>الخزن والسيولة</span>
        </button>

        <button
          onClick={() => setActiveTab('shift')}
          style={{
            padding: '7px 4px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            background: activeTab === 'shift' ? '#f0fdf4' : 'transparent',
            color: activeTab === 'shift' ? '#16a34a' : '#64748b'
          }}
        >
          <Clock size={15} />
          <span>الشيفت الحالي</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          style={{
            padding: '7px 4px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            background: activeTab === 'sales' ? '#faf5ff' : 'transparent',
            color: activeTab === 'sales' ? '#7c3aed' : '#64748b'
          }}
        >
          <TrendingUp size={15} />
          <span>أداء اليوم</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '7px 4px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            background: activeTab === 'inventory' ? '#fffbeb' : 'transparent',
            color: activeTab === 'inventory' ? '#d97706' : '#64748b'
          }}
        >
          <AlertTriangle size={15} />
          <span>النواقص ({lowStockProducts.length})</span>
        </button>
      </div>

      {/* Main Scrollable Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* =========================================================================
            TAB 1: TREASURY & VAULTS (الخزن والسيولة)
           ========================================================================= */}
        {activeTab === 'treasury' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Total Liquidity Master Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '14px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', opacity: 0.9 }}>إجمالي السيولة المالية الحالية:</span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                  كافة الحسابات
                </span>
              </div>
              <div className="num-mono" style={{ fontSize: '26px', fontWeight: 900, margin: '6px 0 2px' }}>
                {formatMoney(balances.totalLiquidity)}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                مجموع: نقدية الخزنة + الفيزا + إنستا باي + درج الكاشير
              </div>
            </div>

            {/* Account Balances Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {/* 1. Main Safe */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: '3px solid #0f172a',
                  borderRadius: '6px',
                  padding: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <ShieldCheck size={16} style={{ color: '#0f172a' }} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>الخزنة الرئيسية</span>
                </div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {formatMoney(balances.mainSafe)}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>نقدية الخزنة المؤمنة</div>
              </div>

              {/* 2. Drawer Cash */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: '3px solid #059669',
                  borderRadius: '6px',
                  padding: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Wallet size={16} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>درج الكاشير</span>
                </div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#047857' }}>
                  {formatMoney(balances.drawer)}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  {activeShift ? `شيفت #${activeShift.shift?.id} مفتوح` : 'لا يوجد شيفت'}
                </div>
              </div>

              {/* 3. Visa */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: '3px solid #2563eb',
                  borderRadius: '6px',
                  padding: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <CreditCard size={16} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>حساب الفيزا</span>
                </div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#1d4ed8' }}>
                  {formatMoney(balances.visa)}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>الدفع بالبطاقات البنكية</div>
              </div>

              {/* 4. InstaPay */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: '3px solid #7c3aed',
                  borderRadius: '6px',
                  padding: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Smartphone size={16} style={{ color: '#7c3aed' }} />
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>إنستا باي ومحافظ</span>
                </div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#6d28d9' }}>
                  {formatMoney(balances.instapay)}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>التحويلات اللحظية</div>
              </div>
            </div>

            {/* Quick Action Buttons for Admin */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {activeShift && expectedDrawer > 0 && (
                <button
                  className="btn btn-sm btn-primary"
                  style={{ flex: 1, padding: '8px', fontSize: '12px', background: '#0284c7', borderColor: '#0284c7' }}
                  onClick={() => setShowTransferModal(true)}
                >
                  <ArrowLeftRight size={14} />
                  <span>تحويل من الدرج للخزنة</span>
                </button>
              )}
              <button
                className="btn btn-sm btn-danger"
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={() => setShowWithdrawModal(true)}
              >
                <ArrowUpFromLine size={14} />
                <span>سحب نقدية</span>
              </button>
              <button
                className="btn btn-sm btn-success"
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={() => setShowDepositModal(true)}
              >
                <Plus size={14} />
                <span>إيداع أموال</span>
              </button>
            </div>

            {/* Recent Treasury Transactions */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
                آخر حركات الخزنة والتحويلات:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {!treasuryData?.recentTransactions || treasuryData.recentTransactions.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>
                    لا توجد حركات مسجلة مؤخراً
                  </div>
                ) : (
                  treasuryData.recentTransactions.slice(0, 8).map((tx, idx) => (
                    <div
                      key={tx.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        background: '#f8fafc',
                        borderRadius: '4px',
                        border: '1px solid #f1f5f9',
                        fontSize: '11px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#334155' }}>{tx.reason}</div>
                        <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>
                          {tx.user_name} • {new Date(tx.created_at).toLocaleTimeString('ar-EG')}
                        </div>
                      </div>
                      <div className="num-mono" style={{ fontWeight: 800, color: tx.type === 'out' ? '#b91c1c' : '#15803d' }}>
                        {tx.type === 'out' ? '-' : '+'}{formatMoney(tx.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SHIFT MONITOR (الشيفت الحالي)
           ========================================================================= */}
        {activeTab === 'shift' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeShift ? (
              <>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderTop: '3px solid #16a34a',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        شيفت نشط: <span className="num-mono">#{shift?.id}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        الكاشير: <strong>{shift?.cashier_name}</strong>
                      </div>
                    </div>
                    <span className="badge badge-success">مفتوح الآن</span>
                  </div>

                  <div
                    style={{
                      background: '#0f172a',
                      color: '#38bdf8',
                      borderRadius: '6px',
                      padding: '10px',
                      textAlign: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>النقدية المتوقعة حالياً بالدرج:</div>
                    <div className="num-mono" style={{ fontSize: '24px', fontWeight: 900 }}>
                      {expectedDrawer.toFixed(2)} ج.م
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px' }}>
                    <div style={{ background: '#f8fafc', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b' }}>العهدة الافتتاحية:</span>
                      <div className="num-mono" style={{ fontWeight: 800 }}>{parseFloat(shift?.opening_cash || 0).toFixed(2)} ج.م</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b' }}>مبيعات نقدي (كاش):</span>
                      <div className="num-mono" style={{ fontWeight: 800, color: '#16a34a' }}>+{parseFloat(shiftSales?.total_cash_sales || 0).toFixed(2)} ج.م</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b' }}>مبيعات فيزا:</span>
                      <div className="num-mono" style={{ fontWeight: 800, color: '#2563eb' }}>{parseFloat(shiftSales?.card_sales || 0).toFixed(2)} ج.م</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b' }}>إنستا باي ومحافظ:</span>
                      <div className="num-mono" style={{ fontWeight: 800, color: '#7c3aed' }}>{parseFloat(shiftSales?.digital_sales || 0).toFixed(2)} ج.م</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>إجمالي الفواتير: <strong>{shiftSales?.total_invoices || 0}</strong></span>
                    <span>وقت الفتح: <strong>{new Date(shift?.start_time).toLocaleTimeString('ar-EG')}</strong></span>
                  </div>

                  {expectedDrawer > 0 && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#0284c7' }}
                      onClick={() => setShowTransferModal(true)}
                    >
                      <ArrowLeftRight size={13} />
                      <span>سحب وتحويل من الدرج إلى الخزنة الرئيسية</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <AlertTriangle size={32} style={{ color: '#dc2626', margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>لا توجد وردية مفتوحة حالياً</h3>
                <p style={{ fontSize: '11.5px', color: '#7f1d1d', margin: '4px 0 0' }}>
                  الكاشير لم يقم بفتح أي شيفت بعد، وبالتالي البيع مغلق حالياً حتى يتم استلام العهدة.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: TODAY'S SALES & PROFIT (أداء اليوم)
           ========================================================================= */}
        {activeTab === 'sales' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', opacity: 0.9 }}>إجمالي مبيعات اليوم:</span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>
                  {metrics.todayInvoices || 0} فاتورة
                </span>
              </div>
              <div className="num-mono" style={{ fontSize: '26px', fontWeight: 900, margin: '6px 0 2px' }}>
                {formatMoney(metrics.todaySales || 0)}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>
                مقارنة بأمس: {formatMoney(metrics.yesterdaySales || 0)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>صافي أرباح مبيعات اليوم:</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#7c3aed' }}>
                  {formatMoney(metrics.todayProfit || 0)}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>هامش ربح إجمالي للمبيعات</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>مصروفات اليوم:</div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#dc2626' }}>
                  {formatMoney(metrics.todayExpenses || 0)}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>نثريات وفواتير تشغيل</div>
              </div>
            </div>

            {/* Inventory Valuation Snapshot */}
            {inventoryStats && (
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  قيمة البضاعة الحالية بالمخزن:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>إجمالي سعر الشراء (التكلفة):</span>
                    <strong className="num-mono">{formatMoney(inventoryStats.totalCostValue)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>إجمالي سعر البيع (القيمة السوقية):</span>
                    <strong className="num-mono" style={{ color: '#059669' }}>{formatMoney(inventoryStats.totalSellingValue)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                    <span style={{ color: '#64748b' }}>الأرباح المتوقعة من البضاعة:</span>
                    <strong className="num-mono" style={{ color: '#7c3aed' }}>
                      {formatMoney(inventoryStats.expectedProfit)} (%{inventoryStats.profitMargin?.toFixed(1)})
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: LOW STOCK & REORDER ALERTS (نواقص المخزون)
           ========================================================================= */}
        {activeTab === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              أصناف قاربت على النفاد (تحتاج للطلب من الموردين):
            </div>

            {lowStockProducts.length === 0 ? (
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                <Check size={32} style={{ color: '#16a34a', margin: '0 auto 6px' }} />
                <h4 style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>مخزونك في أمان تام!</h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>لا توجد أي نواقص أو أصناف وصلت لحد الخطر حالياً.</p>
              </div>
            ) : (
              lowStockProducts.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fed7aa',
                    borderRight: '4px solid #ea580c',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
                    <span
                      className="badge badge-danger"
                      style={{ fontSize: '10.5px', padding: '2px 6px' }}
                    >
                      متبقي: {p.stock_quantity} {p.unit} (أمان: {p.min_stock_alert})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                    <span>باركود: <strong className="num-mono">{p.barcode}</strong></span>
                    <span>سعر الشراء: <strong className="num-mono">{parseFloat(p.purchase_price).toFixed(2)} ج.م</strong></span>
                  </div>

                  {p.supplier_name && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '2px',
                        paddingTop: '4px',
                        borderTop: '1px dashed #f1f5f9',
                        fontSize: '11px'
                      }}
                    >
                      <span style={{ color: '#475569' }}>المورد: <strong>{p.supplier_name}</strong></span>
                      {p.supplier_phone && (
                        <a
                          href={`tel:${p.supplier_phone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#0284c7',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '11px'
                          }}
                        >
                          <Phone size={12} />
                          <span>اتصال ({p.supplier_phone})</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS FOR ADMIN ACTIONS
         ========================================================================= */}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '92%', maxWidth: '400px' }}>
            <div className="modal-header">
              <span>تحويل من الدرج إلى الخزنة</span>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTransfer}>
              <div className="modal-body">
                <div style={{ fontSize: '12px', color: '#0369a1', background: '#f0f9ff', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                  النقدية المتاحة بالدرج: <strong>{expectedDrawer.toFixed(2)} ج.م</strong>
                </div>
                <div className="form-group">
                  <label>المبلغ المطلوب تحويله للخزنة (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>
                <div className="form-group">
                  <label>ملاحظات:</label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="توريد نقدية..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={transferLoading}>
                  {transferLoading ? 'جاري التحويل...' : 'تأكيد التحويل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '92%', maxWidth: '400px' }}>
            <div className="modal-header">
              <span>سحب نقدية للإدارة</span>
              <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>✕</button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="modal-body">
                <div className="form-group">
                  <label>الحساب المطلوب السحب منه (*):</label>
                  <select
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    style={{ padding: '8px' }}
                  >
                    <option value="main_safe">الخزنة الرئيسية ({formatMoney(balances.mainSafe)})</option>
                    <option value="drawer">درج الكاشير ({formatMoney(balances.drawer)})</option>
                    <option value="visa">حساب الفيزا ({formatMoney(balances.visa)})</option>
                    <option value="instapay">إنستا باي ومحافظ ({formatMoney(balances.instapay)})</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>المبلغ (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', color: '#dc2626' }}
                  />
                </div>
                <div className="form-group">
                  <label>السبب والبيان (*):</label>
                  <input
                    type="text"
                    required
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    placeholder="سحب أرباح، إيداع بنك..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-danger" disabled={withdrawLoading}>
                  {withdrawLoading ? 'جاري السحب...' : 'تأكيد السحب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '92%', maxWidth: '400px' }}>
            <div className="modal-header">
              <span>إيداع أموال</span>
              <button className="close-btn" onClick={() => setShowDepositModal(false)}>✕</button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>الحساب المودع فيه (*):</label>
                  <select
                    value={depositAccount}
                    onChange={(e) => setDepositAccount(e.target.value)}
                    style={{ padding: '8px' }}
                  >
                    <option value="main_safe">الخزنة الرئيسية</option>
                    <option value="drawer">درج الكاشير النشط</option>
                    <option value="visa">حساب الفيزا</option>
                    <option value="instapay">إنستا باي والمحافظ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>المبلغ المودع (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center', color: '#16a34a' }}
                  />
                </div>
                <div className="form-group">
                  <label>السبب والمصدر (*):</label>
                  <input
                    type="text"
                    required
                    value={depositReason}
                    onChange={(e) => setDepositReason(e.target.value)}
                    placeholder="زيادة رأس مال، سداد دين..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDepositModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-success" disabled={depositLoading}>
                  {depositLoading ? 'جاري الإيداع...' : 'تأكيد الإيداع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
