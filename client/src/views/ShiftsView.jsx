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
  X,
  CreditCard,
  Smartphone,
  ArrowLeftRight,
  ShieldCheck,
  Wallet,
  Lock,
  Plus
} from 'lucide-react';
import { api } from '../services/api';

export default function ShiftsView({ onShiftChange, currentUser }) {
  const [activeShiftData, setActiveShiftData] = useState(null);
  const [shiftsHistory, setShiftsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Treasury State
  const [treasuryData, setTreasuryData] = useState(null);
  const [treasuryLoading, setTreasuryLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('shifts'); // 'shifts', 'treasury'

  // Shift Modals
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

  // Treasury Actions Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAccount, setWithdrawAccount] = useState('main_safe');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAccount, setDepositAccount] = useState('main_safe');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReason, setDepositReason] = useState('');
  const [depositNotes, setDepositNotes] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const isCashier = currentUser?.role === 'cashier';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'manager';

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

  const loadTreasury = async () => {
    try {
      setTreasuryLoading(true);
      const res = await api.get('/shifts/treasury');
      setTreasuryData(res);
      if (res.defaultOpeningCash) {
        setOpeningCashInput(res.defaultOpeningCash.toString());
      }
    } catch (e) {
      console.error('Failed to load treasury:', e);
    } finally {
      setTreasuryLoading(false);
    }
  };

  useEffect(() => {
    loadActiveShift();
    loadHistory();
    loadTreasury();
  }, []);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shifts/open', {
        openingCash: openingCashInput,
        notes: openingNotes
      });
      alert('تم فتح الشيفت بنجاح واستلام العهدة');
      setShowOpenModal(false);
      loadActiveShift();
      loadHistory();
      loadTreasury();
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
      loadTreasury();
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
      loadTreasury();
    } catch (err) {
      alert(err.message || 'فشل إغلاق الشيفت');
    }
  };

  const handleTransferToSafe = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0) {
      alert('يرجى إدخال مبلغ صحيح للتحويل');
      return;
    }
    setTransferLoading(true);
    try {
      const res = await api.post('/shifts/transfer-to-safe', {
        amount: amt,
        notes: transferNotes
      });
      alert(res.message || 'تم تحويل النقدية من الدرج إلى الخزنة بنجاح');
      setShowTransferModal(false);
      setTransferAmount('');
      setTransferNotes('');
      loadActiveShift();
      loadTreasury();
    } catch (err) {
      alert(err.message || 'فشل تحويل النقدية');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleAdminWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || !withdrawReason) {
      alert('يرجى إدخال الحساب والمبلغ والسبب المطلوب');
      return;
    }
    setWithdrawLoading(true);
    try {
      const res = await api.post('/shifts/admin-withdraw', {
        account: withdrawAccount,
        amount: amt,
        reason: withdrawReason,
        notes: withdrawNotes
      });
      alert(res.message || 'تم تسجيل عملية السحب بنجاح');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawReason('');
      setWithdrawNotes('');
      loadActiveShift();
      loadTreasury();
    } catch (err) {
      alert(err.message || 'فشل عملية السحب');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleAdminDeposit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0 || !depositReason) {
      alert('يرجى إدخال الحساب والمبلغ والسبب');
      return;
    }
    setDepositLoading(true);
    try {
      const res = await api.post('/shifts/admin-deposit', {
        account: depositAccount,
        amount: amt,
        reason: depositReason,
        notes: depositNotes
      });
      alert(res.message || 'تم تسجيل عملية الإيداع بنجاح');
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositReason('');
      setDepositNotes('');
      loadActiveShift();
      loadTreasury();
    } catch (err) {
      alert(err.message || 'فشل عملية الإيداع');
    } finally {
      setDepositLoading(false);
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

  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`;
  };

  const s = activeShiftData?.shift;
  const sales = activeShiftData?.sales || {};
  const ret = activeShiftData?.returns || {};
  const exp = activeShiftData?.expenses || {};
  const expected = activeShiftData?.expectedCash || 0;
  const balances = treasuryData?.balances || {};

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px' }}>
      {/* =========================================================================
          Top Multi-Vault Treasury Summary Cards
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}
      >
        {/* 1. Main Safe (الخزنة الرئيسية) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderTop: '3px solid #1e293b',
            borderRadius: '5px',
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
              الخزنة الرئيسية (Safe Cash)
            </div>
            <div className="num-mono" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {formatMoney(balances.mainSafe)}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              النقدية المحفوظة بالخزنة الحديدية
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e293b'
            }}
          >
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* 2. Visa & Card Balance (رصيد الفيزا) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderTop: '3px solid #2563eb',
            borderRadius: '5px',
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
              رصيد الفيزا والبطاقات (Visa)
            </div>
            <div className="num-mono" style={{ fontSize: '18px', fontWeight: 800, color: '#1d4ed8' }}>
              {formatMoney(balances.visa)}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              مبيعات نقاط البيع البنكية POS
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}
          >
            <CreditCard size={20} />
          </div>
        </div>

        {/* 3. InstaPay & Wallets Balance (إنستا باي والمحافظ) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderTop: '3px solid #7c3aed',
            borderRadius: '5px',
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
              رصيد إنستا باي والمحافظ (InstaPay)
            </div>
            <div className="num-mono" style={{ fontSize: '18px', fontWeight: 800, color: '#6d28d9' }}>
              {formatMoney(balances.instapay)}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              التحويلات اللحظية والمحافظ الذكية
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed'
            }}
          >
            <Smartphone size={20} />
          </div>
        </div>

        {/* 4. Active Drawer Cash (درج الكاشير الحالي) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderTop: '3px solid #059669',
            borderRadius: '5px',
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>
              نقدية الدرج الحالية (Drawer Cash)
            </div>
            <div className="num-mono" style={{ fontSize: '18px', fontWeight: 800, color: '#047857' }}>
              {formatMoney(balances.drawer)}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              {activeShiftData ? `شيفت #${activeShiftData.shift?.id} مفتوح` : 'لا يوجد وردية نشطة حالياً'}
            </div>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}
          >
            <Wallet size={20} />
          </div>
        </div>
      </div>

      {/* Liquidity Ribbon & Actions Toolbar */}
      <div
        className="pos-toolbar"
        style={{
          background: '#ffffff',
          marginBottom: '0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={17} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>إجمالي السيولة المالية:</span>
            <span className="num-mono badge badge-navy" style={{ fontSize: '13px', padding: '2px 8px' }}>
              {formatMoney(balances.totalLiquidity)}
            </span>
          </div>

          <span style={{ color: '#cbd5e1' }}>|</span>

          {/* Sub Tab Switcher */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`btn btn-sm ${activeSubTab === 'shifts' ? 'btn-primary' : ''}`}
              style={{ fontSize: '11px', padding: '2px 8px' }}
              onClick={() => setActiveSubTab('shifts')}
            >
              الورديات وحركات الدرج
            </button>
            <button
              className={`btn btn-sm ${activeSubTab === 'treasury' ? 'btn-primary' : ''}`}
              style={{ fontSize: '11px', padding: '2px 8px' }}
              onClick={() => setActiveSubTab('treasury')}
            >
              سجل حركات الخزنة والتحويلات
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={() => { loadActiveShift(); loadHistory(); loadTreasury(); }}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>

          {/* Transfer Drawer to Safe Button */}
          {activeShiftData && expected > 0 && (
            <button
              className="btn btn-sm btn-primary"
              style={{ background: '#0284c7', borderColor: '#0284c7' }}
              onClick={() => setShowTransferModal(true)}
              title="نقل نقدية من درج الكاشير إلى الخزنة الرئيسية"
            >
              <ArrowLeftRight size={13} />
              <span>تحويل من الدرج للخزنة</span>
            </button>
          )}

          {/* Admin Withdraw Button */}
          {isAdmin && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => setShowWithdrawModal(true)}
              title="سحب أموال من الخزنة أو الدرج أو الحسابات"
            >
              <ArrowUpFromLine size={13} />
              <span>سحب نقدية (للإدارة)</span>
            </button>
          )}

          {/* Admin Deposit Button */}
          {isAdmin && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => setShowDepositModal(true)}
              title="إيداع أموال في الخزنة أو الحسابات"
            >
              <Plus size={13} />
              <span>إيداع أموال</span>
            </button>
          )}

          {!activeShiftData ? (
            <button className="btn btn-sm btn-success" onClick={() => setShowOpenModal(true)}>
              <Play size={13} />
              <span>فتح شيفت كاشير</span>
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
                <span>إيداع درج</span>
              </button>
              <button
                className="btn btn-sm"
                onClick={() => {
                  setTxType('out');
                  setShowCashTxModal(true);
                }}
              >
                <ArrowUpFromLine size={13} />
                <span>سحب درج</span>
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  setActualCashInput(expected.toString());
                  setShowCloseModal(true);
                }}
              >
                <Square size={13} />
                <span>تقفيل الشيفت (Z-Report)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
        {/* Active Shift Panel (Always visible if shift is open) */}
        {activeShiftData ? (
          <div className="pos-panel" style={{ borderTop: '3px solid #162433', flexShrink: 0 }}>
            <div className="pos-panel-header" style={{ background: '#f1f5f9', padding: '6px 12px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
                <span>الشيفت الحالي: <strong className="num-mono">#{s.id}</strong></span>
                <span>الكاشير: <strong>{s.cashier_name}</strong></span>
                <span>وقت الفتح: <span className="num-mono">{new Date(s.start_time).toLocaleTimeString('ar-EG')}</span></span>
              </div>
              <span className="badge badge-success">شيفت مفتوح ونشط حالياً</span>
            </div>

            <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              <div style={{ background: '#f8fafc', padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>العهدة الافتتاحية:</div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800 }}>
                  {parseFloat(s.opening_cash).toFixed(2)} ج.م
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>مبيعات كاش بالدرج:</div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#15803d' }}>
                  +{parseFloat(sales.total_cash_sales || 0).toFixed(2)} ج.م
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>{sales.total_invoices || 0} فاتورة</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>مرتجعات كاش من الدرج:</div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#b71c1c' }}>
                  -{parseFloat(ret.cash_refund || 0).toFixed(2)} ج.م
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>مصروفات مخصومة:</div>
                <div className="num-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#b71c1c' }}>
                  -{parseFloat(exp.total_expenses_amount || 0).toFixed(2)} ج.م
                </div>
              </div>

              {/* Expected Drawer Cash */}
              <div style={{ background: '#0f172a', color: '#38bdf8', padding: '6px 10px', borderRadius: '3px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>النقدية المفترضة بالدرج:</div>
                <div className="num-mono" style={{ fontSize: '18px', fontWeight: 900 }}>
                  {expected.toFixed(2)} ج.م
                </div>
              </div>
            </div>

            {/* Other Payment Methods inside Shift */}
            <div style={{ padding: '0 12px 8px', display: 'flex', gap: '16px', fontSize: '11.5px', color: '#475569' }}>
              <span>مبيعات فيزا وبطاقات: <strong className="num-mono">{parseFloat(sales.card_sales || 0).toFixed(2)} ج.م</strong></span>
              <span>مبيعات إلكترونية (إنستاباي/محافظ): <strong className="num-mono">{parseFloat(sales.digital_sales || 0).toFixed(2)} ج.م</strong></span>
              <span>مبيعات آجلة: <strong className="num-mono">{parseFloat(sales.credit_sales || 0).toFixed(2)} ج.م</strong></span>
            </div>
          </div>
        ) : (
          <div
            className="pos-panel"
            style={{
              padding: '16px',
              textAlign: 'center',
              background: '#fef2f2',
              border: '1px solid #f87171',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <AlertTriangle size={20} style={{ color: '#b91c1c' }} />
              <h3 style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>
                لا يوجد شيفت كاشير مفتوح حالياً
              </h3>
            </div>
            <p style={{ fontSize: '11.5px', color: '#7f1d1d', margin: '4px 0 10px' }}>
              يجب فتح شيفت كاشير واستلام العهدة المحددة لبدء تسجيل حركات البيع والنقدية بشكل منظم
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowOpenModal(true)}>
              <Play size={13} />
              <span>فتح شيفت كاشير جديد الآن</span>
            </button>
          </div>
        )}

        {/* Tab 1: Shifts History */}
        {activeSubTab === 'shifts' && (
          <div className="pos-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="pos-panel-header" style={{ padding: '6px 12px' }}>
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
                    <th style={{ minWidth: '150px', textAlign: 'center' }}>تقرير التقفيل Z-Report</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftsHistory.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        لا توجد شيفتات مسجلة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    shiftsHistory.map(sh => (
                      <tr key={sh.id}>
                        <td style={{ textAlign: 'center', fontWeight: 800 }} className="num-mono">#{sh.id}</td>
                        <td style={{ fontWeight: 600 }}>{sh.cashier_name}</td>
                        <td className="num-mono" style={{ fontSize: '11px' }}>{new Date(sh.start_time).toLocaleString('ar-EG')}</td>
                        <td className="num-mono" style={{ fontSize: '11px' }}>
                          {sh.end_time ? new Date(sh.end_time).toLocaleString('ar-EG') : '-'}
                        </td>
                        <td className="num-mono">{parseFloat(sh.opening_cash || 0).toFixed(2)} ج.م</td>
                        <td className="num-mono" style={{ fontWeight: 700 }}>
                          {sh.closing_cash_expected !== null ? `${parseFloat(sh.closing_cash_expected).toFixed(2)} ج.م` : '-'}
                        </td>
                        <td className="num-mono" style={{ fontWeight: 700 }}>
                          {sh.closing_cash_actual !== null ? `${parseFloat(sh.closing_cash_actual).toFixed(2)} ج.م` : '-'}
                        </td>
                        <td className="num-mono" style={{ fontWeight: 800 }}>
                          {sh.difference !== null ? (
                            <span style={{ color: sh.difference < 0 ? '#b71c1c' : sh.difference > 0 ? '#15803d' : '#475569' }}>
                              {sh.difference > 0 ? `+${parseFloat(sh.difference).toFixed(2)} (زيادة)` : sh.difference < 0 ? `${parseFloat(sh.difference).toFixed(2)} (عجز)` : '0.00 (متطابق)'}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {sh.status === 'open' ? (
                            <span className="badge badge-success">نشط حالياً</span>
                          ) : (
                            <span className="badge">مغلق</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-sm"
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => viewZReport(sh.id)}
                          >
                            <FileText size={12} />
                            <span>عرض التقرير</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Treasury & Transfers History Log */}
        {activeSubTab === 'treasury' && (
          <div className="pos-panel" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="pos-panel-header" style={{ padding: '6px 12px' }}>
              <span>سجل التحويلات بين الخزن وحركات الإيداع والسحب</span>
            </div>

            <div className="table-container" style={{ flex: 1 }}>
              <table className="dense-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>#</th>
                    <th style={{ minWidth: '130px' }}>الحساب المالي</th>
                    <th style={{ minWidth: '100px', textAlign: 'center' }}>نوع الحركة</th>
                    <th style={{ minWidth: '120px' }}>المبلغ</th>
                    <th style={{ minWidth: '150px' }}>البيان / السبب</th>
                    <th style={{ minWidth: '130px' }}>المستخدم المسؤول</th>
                    <th style={{ minWidth: '140px' }}>التاريخ والوقت</th>
                    <th style={{ minWidth: '120px' }}>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {!treasuryData?.recentTransactions || treasuryData.recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        لا توجد حركات تحويل أو سحب مسجلة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    treasuryData.recentTransactions.map((tx, idx) => {
                      const accountNames = {
                        main_safe: 'الخزنة الرئيسية',
                        drawer: 'درج الكاشير',
                        visa: 'حساب الفيزا',
                        instapay: 'حساب إنستا باي'
                      };
                      return (
                        <tr key={tx.id || idx}>
                          <td style={{ textAlign: 'center' }} className="num-mono">{tx.id}</td>
                          <td style={{ fontWeight: 700 }}>{accountNames[tx.account] || tx.account}</td>
                          <td style={{ textAlign: 'center' }}>
                            {tx.type === 'transfer' ? (
                              <span className="badge badge-info">تحويل للخزنة</span>
                            ) : tx.type === 'out' ? (
                              <span className="badge badge-danger">سحب نقدية</span>
                            ) : (
                              <span className="badge badge-success">إيداع</span>
                            )}
                          </td>
                          <td className="num-mono" style={{ fontWeight: 800 }}>
                            <span style={{ color: tx.type === 'out' ? '#b91c1c' : '#15803d' }}>
                              {tx.type === 'out' ? '-' : '+'}{formatMoney(tx.amount)}
                            </span>
                          </td>
                          <td>{tx.reason}</td>
                          <td style={{ fontWeight: 600 }}>{tx.user_name || '-'}</td>
                          <td className="num-mono" style={{ fontSize: '11px' }}>
                            {new Date(tx.created_at).toLocaleString('ar-EG')}
                          </td>
                          <td style={{ fontSize: '11px', color: '#64748b' }}>{tx.notes || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* 1. Open Shift Modal */}
      {showOpenModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '430px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} style={{ color: '#22c55e' }} />
                <span>فتح شيفت كاشير جديد</span>
              </div>
              <button className="close-btn" onClick={() => setShowOpenModal(false)}>✕</button>
            </div>
            <form onSubmit={handleOpenShift}>
              <div className="modal-body">
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ margin: 0, fontWeight: 700 }}>العهدة الافتتاحية في الدرج (ج.م):</label>
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
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '8px',
                      background: isCashier ? '#f1f5f9' : '#ffffff',
                      borderColor: isCashier ? '#cbd5e1' : '#2563eb'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: isCashier ? '#b45309' : '#64748b', marginTop: '4px', display: 'block' }}>
                    {isCashier
                      ? '🔒 هذه العهدة الافتتاحية محددة تلقائياً من قبل الإدارة ولا يمكن تعديلها بواسطة الكاشير.'
                      : 'مبلغ الفكة المتواجد في درج الكاشير قبل بدء البيع'}
                  </span>
                </div>

                <div className="form-group">
                  <label>ملاحظات أو بيان الشيفت:</label>
                  <input
                    type="text"
                    value={openingNotes}
                    onChange={(e) => setOpeningNotes(e.target.value)}
                    placeholder="مثال: شيفت صباحي، استلام عهدة فكة..."
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

      {/* 2. Transfer from Drawer to Main Safe Modal */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeftRight size={18} style={{ color: '#0284c7' }} />
                <span>تحويل نقدية من الدرج إلى الخزنة الرئيسية</span>
              </div>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleTransferToSafe}>
              <div className="modal-body">
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#0369a1',
                    marginBottom: '12px'
                  }}
                >
                  <div>النقدية المتوفرة حالياً بالدرج: <strong className="num-mono">{expected.toFixed(2)} ج.م</strong></div>
                  <div style={{ fontSize: '10.5px', marginTop: '2px' }}>
                    سيتم خصم المبلغ المحول من عهدة الدرج للشيفت الحالي وإيداعه مباشرة في رصيد الخزنة الرئيسية.
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>المبلغ المطلوب تحويله للخزنة (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    max={expected}
                    autoFocus
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', padding: '8px' }}
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات التحويل والتسليم:</label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="مثال: توريد نقدية تصفية منتصف اليوم..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={transferLoading} style={{ background: '#0284c7' }}>
                  {transferLoading ? 'جاري التحويل...' : 'تأكيد التحويل للخزنة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Admin Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpFromLine size={18} style={{ color: '#dc2626' }} />
                <span>سحب نقدية من الخزينة (صلاحية الإدارة)</span>
              </div>
              <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdminWithdraw}>
              <div className="modal-body">
                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>السحب من حساب (*):</label>
                  <select
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    style={{ fontWeight: 700, padding: '7px' }}
                  >
                    <option value="main_safe">الخزنة الرئيسية (المتاح: {formatMoney(balances.mainSafe)})</option>
                    <option value="drawer">درج الكاشير الحالي (المتاح: {formatMoney(balances.drawer)})</option>
                    <option value="visa">حساب الفيزا والبطاقات (المتاح: {formatMoney(balances.visa)})</option>
                    <option value="instapay">حساب إنستا باي والمحافظ (المتاح: {formatMoney(balances.instapay)})</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>المبلغ المطلوب سحبه (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', padding: '8px', color: '#dc2626' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>سبب السحب والغرض (*):</label>
                  <input
                    type="text"
                    required
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    placeholder="مثال: سحب أرباح، إيداع بنكي، سلفة شخصية..."
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات إضافية:</label>
                  <input
                    type="text"
                    value={withdrawNotes}
                    onChange={(e) => setWithdrawNotes(e.target.value)}
                    placeholder="تفاصيل أخرى للمراجعة والتدقيق..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-danger" disabled={withdrawLoading}>
                  {withdrawLoading ? 'جاري السحب...' : 'تأكيد السحب الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Admin Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: '#16a34a' }} />
                <span>إيداع أموال في الخزينة (صلاحية الإدارة)</span>
              </div>
              <button className="close-btn" onClick={() => setShowDepositModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdminDeposit}>
              <div className="modal-body">
                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>الإيداع في حساب (*):</label>
                  <select
                    value={depositAccount}
                    onChange={(e) => setDepositAccount(e.target.value)}
                    style={{ fontWeight: 700, padding: '7px' }}
                  >
                    <option value="main_safe">الخزنة الرئيسية</option>
                    <option value="drawer">درج الكاشير النشط</option>
                    <option value="visa">حساب الفيزا والبطاقات</option>
                    <option value="instapay">حساب إنستا باي والمحافظ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>المبلغ المودع (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', padding: '8px', color: '#16a34a' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700 }}>سبب ومصدر الإيداع (*):</label>
                  <input
                    type="text"
                    required
                    value={depositReason}
                    onChange={(e) => setDepositReason(e.target.value)}
                    placeholder="مثال: زيادة رأس مال، سداد دين خارجي، تمويل سيولة..."
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات إضافية:</label>
                  <input
                    type="text"
                    value={depositNotes}
                    onChange={(e) => setDepositNotes(e.target.value)}
                    placeholder="تفاصيل إضافية..."
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

      {/* 5. Cash In / Out inside Shift Modal */}
      {showCashTxModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <span>{txType === 'in' ? 'إيداع نقدية في الدرج (Cash In)' : 'سحب نقدية من الدرج (Cash Out)'}</span>
              <button className="close-btn" onClick={() => setShowCashTxModal(false)}>✕</button>
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
                    placeholder="0.00"
                    style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>

                <div className="form-group">
                  <label>السبب والبيان (*):</label>
                  <input
                    type="text"
                    required
                    value={txReason}
                    onChange={(e) => setTxReason(e.target.value)}
                    placeholder={txType === 'in' ? 'مثال: تغذية فكة من الخزنة' : 'مثال: توريد لجزء من النقدية'}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCashTxModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">تأكيد الحركة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Close Shift Z-Report Modal */}
      {showCloseModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Square size={16} style={{ color: '#b91c1c' }} />
                <span>تقفيل وإغلاق الشيفت (Shift Z-Report)</span>
              </div>
              <button className="close-btn" onClick={() => setShowCloseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCloseShift}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', padding: '10px', border: '1px solid #cbd5e1', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>العهدة الافتتاحية:</span>
                    <strong>{parseFloat(s?.opening_cash || 0).toFixed(2)} ج.م</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>مبيعات نقدي (كاش):</span>
                    <strong style={{ color: '#15803d' }}>+{parseFloat(sales.total_cash_sales || 0).toFixed(2)} ج.م</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>مرتجعات كاش:</span>
                    <strong style={{ color: '#b71c1c' }}>-{parseFloat(ret.cash_refund || 0).toFixed(2)} ج.م</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>مصروفات مخصومة:</span>
                    <strong style={{ color: '#b71c1c' }}>-{parseFloat(exp.total_expenses_amount || 0).toFixed(2)} ج.م</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>النقدية المتوقعة بالدرج:</span>
                    <span className="num-mono" style={{ color: '#162433', fontSize: '15px' }}>{expected.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, color: '#162433' }}>
                    النقدية الفعلية المحسوبة في الدرج (ج.م) (*):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    placeholder="0.00"
                    style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', padding: '8px', color: '#15803d' }}
                  />
                  {actualCashInput !== '' && (
                    <div style={{ marginTop: '6px', fontSize: '12px', textAlign: 'center' }}>
                      الفارق المحسوب:{' '}
                      <strong className="num-mono" style={{ color: (parseFloat(actualCashInput) - expected) < 0 ? '#b71c1c' : '#15803d' }}>
                        {(parseFloat(actualCashInput) - expected) >= 0 ? `+${(parseFloat(actualCashInput) - expected).toFixed(2)} (زيادة)` : `${(parseFloat(actualCashInput) - expected).toFixed(2)} (عجز)`}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>ملاحظات التقفيل والتسليم:</label>
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

      {/* 7. Full Z-Report Preview Modal */}
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
