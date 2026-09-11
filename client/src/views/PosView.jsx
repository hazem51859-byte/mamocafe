import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  PlayCircle,
  Percent,
  CreditCard,
  Printer,
  RotateCcw,
  X,
  User,
  Check,
  Scale,
  DollarSign,
  Layers,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';
import { api } from '../services/api';
import { playScanBeep, playErrorBuzz, playSuccessChime } from '../utils/audio';

export default function PosView({
  currentUser,
  activeShift,
  onOpenReceipt,
  onOpenReturns,
  soundEnabled = true,
  storeSettings,
  onOpenShift,
  onCloseShift
}) {
  // State
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [notes, setNotes] = useState('');

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [heldInvoices, setHeldInvoices] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightProduct, setWeightProduct] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [unitProduct, setUnitProduct] = useState(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [mixedDetails, setMixedDetails] = useState({ cash: '', visa: '', wallet: '' });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState(null);

  const barcodeInputRef = useRef(null);

  // Focus barcode input
  const focusBarcode = () => {
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 100);
  };

  useEffect(() => {
    focusBarcode();
  }, [showPaymentModal, showSearchModal, showHoldModal, showDiscountModal]);

  // Load Customers & Categories on mount
  useEffect(() => {
    async function initData() {
      try {
        const [custRes, catRes] = await Promise.all([
          api.get('/customers'),
          api.get('/categories')
        ]);
        setCustomers(custRes || []);
        setCategories(catRes || []);
      } catch (e) {
        console.error('Error loading POS init data:', e);
      }
    }
    initData();
  }, []);

  // Load products when category clicked
  useEffect(() => {
    async function loadCategoryProds() {
      try {
        const res = await api.get('/pos/search', { q: '' });
        setCategoryProducts(res || []);
      } catch (e) {}
    }
    loadCategoryProds();
  }, []);

  // Keyboard Shortcuts Listener (F1 - F9, ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in a modal text field
      if (e.target.tagName === 'INPUT' && e.target !== barcodeInputRef.current && e.key !== 'Escape') {
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          handleNewSale();
          break;
        case 'F2':
          e.preventDefault();
          setShowSearchModal(true);
          break;
        case 'F3':
          e.preventDefault();
          document.getElementById('pos-customer-select')?.focus();
          break;
        case 'F4':
          e.preventDefault();
          handleHoldSale();
          break;
        case 'F5':
          e.preventDefault();
          loadHeldSales();
          break;
        case 'F6':
          e.preventDefault();
          setShowDiscountModal(true);
          break;
        case 'F7':
          e.preventDefault();
          if (cart.length > 0) openPaymentModal();
          break;
        case 'F8':
          e.preventDefault();
          if (lastCompletedSale) onOpenReceipt(lastCompletedSale);
          break;
        case 'F9':
          e.preventDefault();
          onOpenReturns();
          break;
        case 'Escape':
          e.preventDefault();
          setShowSearchModal(false);
          setShowHoldModal(false);
          setShowDiscountModal(false);
          setShowPaymentModal(false);
          setShowWeightModal(false);
          setShowUnitModal(false);
          focusBarcode();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, lastCompletedSale]);

  // Add product to cart logic
  const addProductToCart = (product, qty = 1, selectedUnit = null) => {
    // If sold by weight and no weight given yet, open weight modal
    if (product.is_weight && qty === 1 && !weightProduct) {
      setWeightProduct(product);
      setWeightInput('');
      setShowWeightModal(true);
      return;
    }

    if (soundEnabled) playScanBeep();

    const unitName = selectedUnit ? selectedUnit.unit_name : product.unit;
    const unitPrice = selectedUnit ? selectedUnit.selling_price : product.selling_price;
    const conversionFactor = selectedUnit ? selectedUnit.conversion_factor : 1;
    const lineBarcode = selectedUnit?.barcode || product.barcode;

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.productId === product.id && item.unit === unitName);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newQty = item.quantity + qty;
        item.quantity = Math.round(newQty * 1000) / 1000;
        item.lineTotal = Math.round((item.quantity * item.unitPrice - item.discountAmount) * 100) / 100;
        return updated;
      } else {
        const lineTotal = Math.round((qty * unitPrice) * 100) / 100;
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            barcode: lineBarcode,
            unit: unitName,
            conversionFactor,
            quantity: qty,
            unitPrice,
            discountAmount: 0,
            lineTotal,
            availableUnits: product.units || [],
            rawProduct: product
          }
        ];
      }
    });

    setBarcodeInput('');
    focusBarcode();
  };

  // Barcode enter submit
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    try {
      const results = await api.get('/pos/search', { q: code });
      if (results && results.length > 0) {
        const matched = results[0];
        if (matched.selectedUnit) {
          addProductToCart(matched, 1, matched.selectedUnit);
        } else {
          addProductToCart(matched, 1);
        }
      } else {
        if (soundEnabled) playErrorBuzz();
        alert(`المنتج بالباركود (${code}) غير مسجل في النظام`);
      }
    } catch (err) {
      if (soundEnabled) playErrorBuzz();
      console.error(err);
    }
  };

  // Search in modal
  const handleModalSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get('/pos/search', { q: query.trim() });
      setSearchResults(res || []);
    } catch (e) {}
  };

  // Cart row quantity changes
  const updateQuantity = (index, delta) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = Math.max(0.001, item.quantity + delta);
      item.quantity = Math.round(newQty * 1000) / 1000;
      item.lineTotal = Math.round((item.quantity * item.unitPrice - item.discountAmount) * 100) / 100;
      return updated;
    });
  };

  const setExactQuantity = (index, val) => {
    const qty = parseFloat(val) || 0;
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      item.quantity = Math.max(0, qty);
      item.lineTotal = Math.round((item.quantity * item.unitPrice - item.discountAmount) * 100) / 100;
      return updated;
    });
  };

  const setExactPrice = (index, val) => {
    const p = parseFloat(val) || 0;
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      item.unitPrice = p;
      item.lineTotal = Math.round((item.quantity * item.unitPrice - item.discountAmount) * 100) / 100;
      return updated;
    });
  };

  const removeCartItem = (index) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
    focusBarcode();
  };

  // Totals
  const subtotal = cart.reduce((acc, item) => acc + item.lineTotal, 0);
  const grandTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  // New Sale
  const handleNewSale = () => {
    if (cart.length > 0 && !window.confirm('هل تريد إلغاء الفاتورة الحالية وبدء فاتورة جديدة؟')) {
      return;
    }
    setCart([]);
    setDiscountAmount(0);
    setCustomerId('');
    setBarcodeInput('');
    focusBarcode();
  };

  // Hold Sale
  const handleHoldSale = async () => {
    if (cart.length === 0) {
      alert('لا يمكن تعليق فاتورة فارغة');
      return;
    }
    try {
      const cust = customers.find(c => String(c.id) === String(customerId));
      const ref = `فاتورة معلقة (${cust ? cust.name : 'نقدي'}) - ${new Date().toLocaleTimeString('ar-EG')}`;
      await api.post('/pos/hold', {
        reference: ref,
        items: cart,
        customerId: customerId || null,
        subtotal
      });
      alert('تم تعليق الفاتورة بنجاح ويمكن استرجاعها عبر (F5)');
      setCart([]);
      setDiscountAmount(0);
      setCustomerId('');
      focusBarcode();
    } catch (e) {
      alert(e.message || 'فشل تعليق الفاتورة');
    }
  };

  // Load Held Sales
  const loadHeldSales = async () => {
    try {
      const res = await api.get('/pos/held');
      setHeldInvoices(res || []);
      setShowHoldModal(true);
    } catch (e) {
      alert('فشل تحميل الفواتير المعلقة');
    }
  };

  const resumeHeldSale = async (heldId) => {
    try {
      const res = await api.post(`/pos/resume/${heldId}`);
      if (res.heldSale) {
        setCart(res.heldSale.items || []);
        setCustomerId(res.heldSale.customerId || '');
        setShowHoldModal(false);
        focusBarcode();
      }
    } catch (e) {
      alert(e.message || 'فشل استرجاع الفاتورة');
    }
  };

  const deleteHeldSale = async (heldId) => {
    if (!window.confirm('هل تريد حذف هذه الفاتورة المعلقة؟')) return;
    try {
      await api.delete(`/pos/held/${heldId}`);
      setHeldInvoices(prev => prev.filter(h => h.id !== heldId));
    } catch (e) {
      alert(e.message);
    }
  };

  // Payment Open
  const openPaymentModal = () => {
    if (cart.length === 0) return;
    setPaidAmount(grandTotal.toString());
    setShowPaymentModal(true);
  };

  // Checkout process
  const handleCompleteCheckout = async () => {
    setCheckoutLoading(true);
    try {
      let paidVal = parseFloat(paidAmount) || grandTotal;
      let details = {};

      if (paymentMethod === 'mixed') {
        const c = parseFloat(mixedDetails.cash) || 0;
        const v = parseFloat(mixedDetails.visa) || 0;
        const w = parseFloat(mixedDetails.wallet) || 0;
        paidVal = c + v + w;
        details = { cash: c, visa: v, wallet: w };
        if (paidVal < grandTotal) {
          alert(`إجمالي مبالغ الدفع المركب (${paidVal} ج.م) أقل من إجمالي الفاتورة (${grandTotal} ج.م)`);
          setCheckoutLoading(false);
          return;
        }
      }

      const payload = {
        items: cart,
        customerId: customerId || null,
        discountAmount,
        paymentMethod,
        paymentDetails: details,
        paidAmount: paidVal,
        notes
      };

      const res = await api.post('/pos/checkout', payload);

      if (soundEnabled) playSuccessChime();

      setLastCompletedSale(res.sale);
      setShowPaymentModal(false);
      setCart([]);
      setDiscountAmount(0);
      setCustomerId('');
      setNotes('');

      // Automatically open receipt preview
      onOpenReceipt(res.sale);
      focusBarcode();
    } catch (err) {
      if (soundEnabled) playErrorBuzz();
      alert(err.message || 'حدث خطأ أثناء إتمام عملية البيع');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle Weight Modal Submit
  const handleWeightConfirm = () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) {
      alert('يرجى إدخال وزن صحيح بالكيلوجرام (مثال: 0.350 لـ 350 جرام)');
      return;
    }
    addProductToCart(weightProduct, w);
    setShowWeightModal(false);
    setWeightProduct(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#eef2f6' }}>
      {/* Shift Alert Banner if No Shift is Active */}
      {!activeShift && (
        <div
          style={{
            background: '#fff1f2',
            borderBottom: '2px solid #f43f5e',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#9f1239',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ color: '#e11d48', flexShrink: 0 }} />
            <span>تنبيه: لا يوجد شيفت كاشير مفتوح حالياً. يرجى فتح شيفت لتسجيل عهدة الدرج وبدء المبيعات!</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-success"
            onClick={onOpenShift}
            style={{ padding: '2px 10px', fontSize: '11.5px', height: '26px' }}
          >
            <Play size={12} />
            <span>فتح شيفت كاشير الآن</span>
          </button>
        </div>
      )}

      {/* Top POS Toolbar: Barcode Input & Instant Category Chips */}
      <div
        className="pos-toolbar"
        style={{
          background: '#ffffff',
          borderBottom: '2px solid #cbd5e1',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {/* Barcode scanner input */}
        <form onSubmit={handleBarcodeSubmit} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: '0 0 340px' }}>
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <Barcode size={18} style={{ position: 'absolute', right: '8px', color: '#1e3a5f' }} />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="امسح أو اكتب الباركود واضغط Enter..."
              style={{
                width: '100%',
                padding: '6px 32px 6px 8px',
                fontSize: '13px',
                fontWeight: 700,
                border: '2px solid #1e3a5f',
                background: '#ffffff',
                color: '#0f172a'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 10px' }}>
            إضافة
          </button>
        </form>

        {/* Search Product Button (F2) */}
        <button className="btn" onClick={() => setShowSearchModal(true)} title="بحث بالاسم أو الكود (F2)">
          <Search size={14} />
          <span>بحث صنف (F2)</span>
        </button>

        {/* Customer Select (F3) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={14} style={{ color: '#64748b' }} />
          <select
            id="pos-customer-select"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            style={{ width: '180px', fontSize: '12px' }}
          >
            <option value="">عميل نقدي عام</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.balance > 0 ? `(عليه ${c.balance} ج)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Fast Category Filter Chips */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', flex: 1, padding: '2px 0' }}>
          <button
            className={`btn btn-sm ${selectedCategory === null ? 'btn-primary' : ''}`}
            onClick={() => setSelectedCategory(null)}
            style={{ padding: '3px 8px', fontSize: '11px' }}
          >
            الكل
          </button>
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat.id}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Middle Layout: Products Table (Left) + Invoice Summary Panel (Right) */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '8px', padding: '8px', overflow: 'hidden' }}>
        {/* Left Side: Invoice Items Table */}
        <div className="pos-panel" style={{ height: '100%', overflow: 'hidden' }}>
          <div className="pos-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>جدول أصناف الفاتورة الحالية</span>
              <span className="badge badge-info">{cart.length} أصناف</span>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-sm btn-danger" onClick={handleNewSale} title="فاتورة جديدة (F1)">
                <RotateCcw size={12} />
                <span>جديدة (F1)</span>
              </button>
              <button className="btn btn-sm" onClick={handleHoldSale} title="تعليق الفاتورة (F4)">
                <PauseCircle size={12} />
                <span>تعليق (F4)</span>
              </button>
              <button className="btn btn-sm" onClick={loadHeldSales} title="استرجاع المعلقة (F5)">
                <PlayCircle size={12} />
                <span>المعلقة (F5)</span>
              </button>
              {activeShift ? (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={onCloseShift}
                  style={{ background: '#7f1d1d', borderColor: '#b91c1c', color: '#fecaca' }}
                  title="تقفيل وإغلاق الشيفت"
                >
                  <Square size={12} />
                  <span>إغلاق الشيفت</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={onOpenShift}
                  title="فتح شيفت كاشير جديد"
                >
                  <Play size={12} />
                  <span>فتح شيفت</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="dense-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>الباركود</th>
                  <th>اسم الصنف</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>الوحدة</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>الكمية</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>السعر</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>خصم</th>
                  <th style={{ width: '100px', textAlign: 'left' }}>الإجمالي</th>
                  <th style={{ width: '40px', textAlign: 'center' }}>حذف</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>الفاتورة فارغة</div>
                      <div style={{ fontSize: '12px' }}>
                        امسح الباركود بجهاز الاسكانر أو اضغط (F2) للبحث بالاسم لإضافة الأصناف
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={`${item.productId}-${item.unit}-${idx}`}>
                      <td style={{ textAlign: 'center' }} className="num-mono">{idx + 1}</td>
                      <td className="num-mono" style={{ fontSize: '11px', color: '#475569' }}>{item.barcode}</td>
                      <td style={{ fontWeight: 700 }}>
                        {item.name}
                        {item.conversionFactor > 1 && (
                          <span style={{ fontSize: '10px', color: '#234e70', marginRight: '4px' }}>
                            (تحتوي {item.conversionFactor} قطعة)
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {item.availableUnits && item.availableUnits.length > 0 ? (
                          <button
                            className="btn btn-sm"
                            style={{ padding: '1px 5px', fontSize: '11px' }}
                            onClick={() => {
                              setUnitProduct(item);
                              setShowUnitModal(true);
                            }}
                            title="تغيير وحدة البيع (قطعة / كرتونة)"
                          >
                            {item.unit}
                          </button>
                        ) : (
                          <span className="badge badge-navy">{item.unit}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <button
                            className="btn btn-sm"
                            style={{ padding: '2px 5px' }}
                            onClick={() => updateQuantity(idx, -1)}
                          >
                            <Minus size={11} />
                          </button>
                          <input
                            type="number"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => setExactQuantity(idx, e.target.value)}
                            style={{ width: '54px', textAlign: 'center', padding: '2px', fontWeight: 700 }}
                          />
                          <button
                            className="btn btn-sm"
                            style={{ padding: '2px 5px' }}
                            onClick={() => updateQuantity(idx, 1)}
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          step="0.25"
                          value={item.unitPrice}
                          onChange={(e) => setExactPrice(idx, e.target.value)}
                          style={{ width: '70px', textAlign: 'center', padding: '2px', fontWeight: 600 }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }} className="num-mono">
                        {item.discountAmount > 0 ? `${item.discountAmount}` : '-'}
                      </td>
                      <td style={{ textAlign: 'left', fontWeight: 800 }} className="num-mono">
                        {item.lineTotal.toFixed(2)} ج.م
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-sm btn-danger"
                          style={{ padding: '2px 5px' }}
                          onClick={() => removeCartItem(idx)}
                          title="إلغاء الصنف"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Invoice Financial Summary & Checkout Panel */}
        <div className="pos-panel" style={{ height: '100%', justifyContent: 'space-between' }}>
          <div className="pos-panel-header">
            <span>ملخص الفاتورة والحساب</span>
          </div>

          <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Financial Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>المجموع الفرعي:</span>
                <strong className="num-mono" style={{ fontSize: '15px' }}>{subtotal.toFixed(2)} ج.م</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>الخصم الإجمالي (F6):</span>
                  <button
                    className="btn btn-sm"
                    style={{ padding: '1px 5px', fontSize: '10.5px' }}
                    onClick={() => setShowDiscountModal(true)}
                  >
                    تعديل
                  </button>
                </div>
                <strong className="num-mono" style={{ color: '#b71c1c' }}>
                  {discountAmount > 0 ? `- ${discountAmount.toFixed(2)}` : '0.00'} ج.م
                </strong>
              </div>



              <div style={{ height: '2px', background: '#0f172a', margin: '4px 0' }} />

              {/* Grand Total Box (High contrast traditional POS register screen) */}
              <div
                style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: '10px 14px',
                  borderRadius: '3px',
                  textAlign: 'center',
                  border: '2px solid #1e293b'
                }}
              >
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>الإجمالي النهائي المطلوب</div>
                <div className="num-mono" style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '1px' }}>
                  {grandTotal.toFixed(2)} <span style={{ fontSize: '16px' }}>ج.م</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>
                  طريقة السداد:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  {[
                    { id: 'cash', label: 'نقدي (Cash)' },
                    { id: 'visa', label: 'فيزا (Visa)' },
                    { id: 'instapay', label: 'إنستاباي (Instapay)' },
                    { id: 'credit', label: 'آجل (حساب العميل)' },
                    { id: 'mixed', label: 'دفع مركب (مجزأ)' }
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      className={`btn btn-sm ${paymentMethod === pm.id ? 'btn-primary' : ''}`}
                      onClick={() => setPaymentMethod(pm.id)}
                      style={{ fontSize: '11px', padding: '5px' }}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Checkout Big Action Button (F7) */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                className="btn btn-success btn-lg"
                onClick={openPaymentModal}
                disabled={cart.length === 0}
                style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 800 }}
              >
                <DollarSign size={20} />
                <span>إتمام ودفع الفاتورة (F7)</span>
              </button>

              {lastCompletedSale && (
                <button
                  className="btn btn-sm"
                  onClick={() => onOpenReceipt(lastCompletedSale)}
                  style={{ width: '100%' }}
                >
                  <Printer size={13} />
                  <span>طباعة آخر فاتورة ({lastCompletedSale.invoice_number}) [F8]</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Keyboard Shortcuts Bar at Bottom */}
      <div className="shortcuts-bar">
        <div className="shortcut-item"><span className="key-badge">F1</span> فاتورة جديدة</div>
        <div className="shortcut-item"><span className="key-badge">F2</span> بحث صنف</div>
        <div className="shortcut-item"><span className="key-badge">F3</span> اختيار عميل</div>
        <div className="shortcut-item"><span className="key-badge">F4</span> تعليق الفاتورة</div>
        <div className="shortcut-item"><span className="key-badge">F5</span> استرجاع معلقة</div>
        <div className="shortcut-item"><span className="key-badge">F6</span> خصم الفاتورة</div>
        <div className="shortcut-item"><span className="key-badge">F7</span> الدفع والحساب</div>
        <div className="shortcut-item"><span className="key-badge">F8</span> طباعة الأخيرة</div>
        <div className="shortcut-item"><span className="key-badge">F9</span> المرتجعات</div>
        <div className="shortcut-item"><span className="key-badge">ESC</span> إلغاء / رجوع</div>
      </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* 1. Search Modal (F2) */}
      {showSearchModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '700px', maxHeight: '80vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={16} />
                <span>البحث عن صنف بالاسم أو الكود (F2)</span>
              </div>
              <button className="close-btn" onClick={() => setShowSearchModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => handleModalSearch(e.target.value)}
                placeholder="اكتب اسم المنتج (مثل: جهينة، شيبسي، جبنة، أرز...)"
                style={{ width: '100%', padding: '8px', fontSize: '14px', marginBottom: '10px' }}
              />

              <div className="table-container" style={{ maxHeight: '350px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>اسم المنتج</th>
                      <th>الباركود</th>
                      <th>القسم</th>
                      <th>السعر</th>
                      <th>المخزون</th>
                      <th>إضافة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(searchResults.length > 0 ? searchResults : categoryProducts).map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td className="num-mono">{p.barcode}</td>
                        <td>{p.category_name || '-'}</td>
                        <td className="num-mono" style={{ fontWeight: 700, color: '#1b5e20' }}>
                          {parseFloat(p.selling_price).toFixed(2)} ج.م
                        </td>
                        <td className="num-mono">
                          <span className={`badge ${p.stock_quantity <= p.min_stock_alert ? 'badge-danger' : 'badge-navy'}`}>
                            {p.stock_quantity} {p.unit}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              addProductToCart(p, 1);
                              setShowSearchModal(false);
                            }}
                          >
                            <Plus size={12} />
                            <span>إضافة</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Weight Input Modal */}
      {showWeightModal && weightProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '380px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={16} />
                <span>إدخال الوزن - {weightProduct.name}</span>
              </div>
              <button className="close-btn" onClick={() => setShowWeightModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '12.5px', marginBottom: '8px', color: '#475569' }}>
                سعر الكيلو: <strong className="num-mono">{weightProduct.selling_price} ج.م</strong>
              </div>
              <div className="form-group">
                <label>الوزن بالكيلوجرام (مثال: 0.250 لـ ربع كيلو):</label>
                <input
                  type="number"
                  step="0.001"
                  autoFocus
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleWeightConfirm(); }}
                  placeholder="0.000"
                  style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', padding: '8px' }}
                />
              </div>

              {/* Quick weight buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '8px' }}>
                {[
                  { label: 'ربع كجم', val: '0.250' },
                  { label: 'نصف كجم', val: '0.500' },
                  { label: '1 كجم', val: '1.000' },
                  { label: '2 كجم', val: '2.000' }
                ].map(w => (
                  <button
                    key={w.val}
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setWeightInput(w.val)}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowWeightModal(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleWeightConfirm}>تأكيد الوزن والإضافة</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Multi-Unit Picker Modal */}
      {showUnitModal && unitProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} />
                <span>اختيار وحدة البيع - {unitProduct.name}</span>
              </div>
              <button className="close-btn" onClick={() => setShowUnitModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Default Unit */}
                <div
                  onClick={() => {
                    addProductToCart(unitProduct.rawProduct, 1, null);
                    setShowUnitModal(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: '#ffffff'
                  }}
                >
                  <span>الوحدة الأساسية ({unitProduct.rawProduct?.unit || 'قطعة'})</span>
                  <strong className="num-mono">{unitProduct.rawProduct?.selling_price} ج.م</strong>
                </div>

                {/* Additional Units */}
                {unitProduct.availableUnits?.map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      addProductToCart(unitProduct.rawProduct, 1, u);
                      setShowUnitModal(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      background: '#f8fafc'
                    }}
                  >
                    <span>{u.unit_name} (معامل التحويل: {u.conversion_factor})</span>
                    <strong className="num-mono">{u.selling_price} ج.م</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Held Sales Modal (F5) */}
      {showHoldModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px', maxHeight: '75vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlayCircle size={16} />
                <span>الفواتير المعلقة (F5)</span>
              </div>
              <button className="close-btn" onClick={() => setShowHoldModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {heldInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  لا توجد فواتير معلقة حالياً
                </div>
              ) : (
                <div className="table-container">
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>رقم الإشارة</th>
                        <th>الكاشير</th>
                        <th>عدد الأصناف</th>
                        <th>المجموع</th>
                        <th>الوقت</th>
                        <th>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {heldInvoices.map(h => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 600 }}>{h.hold_reference}</td>
                          <td>{h.cashier_name || 'كاشير'}</td>
                          <td className="num-mono" style={{ textAlign: 'center' }}>{h.items?.length || 0}</td>
                          <td className="num-mono" style={{ fontWeight: 700 }}>{parseFloat(h.subtotal || 0).toFixed(2)} ج.م</td>
                          <td className="num-mono" style={{ fontSize: '11px' }}>
                            {new Date(h.created_at).toLocaleTimeString('ar-EG')}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => resumeHeldSale(h.id)}
                              >
                                استرجاع
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteHeldSale(h.id)}
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Discount Modal (F6) */}
      {showDiscountModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '350px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Percent size={16} />
                <span>تطبيق خصم على الفاتورة (F6)</span>
              </div>
              <button className="close-btn" onClick={() => setShowDiscountModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>قيمة الخصم بالجنيه المصري (ج.م):</label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="0.00"
                  style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDiscountModal(false)}>إلغاء</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDiscountAmount(Math.max(0, parseFloat(discountInput) || 0));
                  setShowDiscountModal(false);
                  focusBarcode();
                }}
              >
                تطبيق الخصم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Checkout / Payment Modal (F7) */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={16} />
                <span>سداد الفاتورة والدفع النهائي</span>
              </div>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Grand Total Banner */}
              <div
                style={{
                  background: '#162433',
                  color: '#38bdf8',
                  padding: '12px',
                  borderRadius: '3px',
                  textAlign: 'center',
                  marginBottom: '14px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>المبلغ الإجمالي المستحق</div>
                <div className="num-mono" style={{ fontSize: '26px', fontWeight: 900 }}>
                  {grandTotal.toFixed(2)} ج.م
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="form-group">
                <label>طريقة الدفع:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  <option value="cash">نقدي (Cash)</option>
                  <option value="visa">بطاقة فيزا (Visa)</option>
                  <option value="mastercard">ماستركارد (Mastercard)</option>
                  <option value="wallet">محفظة إلكترونية (Vodafone Cash / We Pay)</option>
                  <option value="instapay">تحويل إنستاباي (Instapay)</option>
                  <option value="credit">آجل / على الحساب (Customer Debt)</option>
                  <option value="mixed">دفع مركب مجزأ (Cash + Visa)</option>
                </select>
              </div>

              {/* Mixed Payment Details */}
              {paymentMethod === 'mixed' && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px', borderRadius: '3px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '6px' }}>توزيع مبالغ الدفع المركب:</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>كاش:</label>
                      <input
                        type="number"
                        step="any"
                        value={mixedDetails.cash}
                        onChange={(e) => setMixedDetails({ ...mixedDetails, cash: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="form-group">
                      <label>فيزا / بطاقة:</label>
                      <input
                        type="number"
                        step="any"
                        value={mixedDetails.visa}
                        onChange={(e) => setMixedDetails({ ...mixedDetails, visa: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Paid Amount & Change Calculation */}
              {paymentMethod === 'cash' && (
                <div className="form-group">
                  <label>المبلغ المستلم من العميل (المدفوع نقداً):</label>
                  <input
                    type="number"
                    step="any"
                    autoFocus
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
                  />

                  {parseFloat(paidAmount) >= grandTotal && (
                    <div
                      style={{
                        marginTop: '8px',
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '8px 12px',
                        borderRadius: '3px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 700
                      }}
                    >
                      <span>الباقي للعميل:</span>
                      <span className="num-mono" style={{ fontSize: '18px' }}>
                        {(parseFloat(paidAmount) - grandTotal).toFixed(2)} ج.م
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="form-group">
                <label>ملاحظات إضافية على الفاتورة:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات اختيارية..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>إلغاء</button>
              <button
                className="btn btn-success btn-lg"
                disabled={checkoutLoading}
                onClick={handleCompleteCheckout}
                style={{ padding: '8px 18px' }}
              >
                <Check size={16} />
                <span>{checkoutLoading ? 'جاري المعالجة...' : 'تأكيد البيع والطباعة (Enter)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
