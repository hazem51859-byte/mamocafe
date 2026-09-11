import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Eye, RefreshCw, X, Check, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import ProductSearchSelect from '../components/ProductSearchSelect';

export default function PurchasesView() {
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [discountAmount, setDiscountAmount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('0');
  const [notes, setNotes] = useState('');

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchases');
      setPurchases(res.purchases || []);
      setSummary(res.summary || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/products', { limit: 200 })
        ]);
        setSuppliers(sRes || []);
        setProducts(pRes.products || []);
      } catch (e) {}
    }
    loadMeta();
    loadPurchases();
  }, []);

  const handleOpenAdd = () => {
    setSupplierId(suppliers[0]?.id || '');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setPurchaseItems([]);
    setDiscountAmount('0');
    setPaidAmount('0');
    setNotes('');
    setShowAddModal(true);
  };

  const addPurchaseRow = () => {
    if (products.length === 0) return;
    const defaultP = products[0];
    setPurchaseItems(prev => [
      ...prev,
      {
        productId: defaultP.id,
        quantity: 10,
        purchasePrice: defaultP.purchase_price
      }
    ]);
  };

  const updatePurchaseRow = (index, field, val) => {
    setPurchaseItems(prev => {
      const copy = [...prev];
      copy[index][field] = val;
      if (field === 'productId') {
        const prod = products.find(p => String(p.id) === String(val));
        if (prod) copy[index].purchasePrice = prod.purchase_price;
      }
      return copy;
    });
  };

  const removePurchaseRow = (index) => {
    setPurchaseItems(prev => prev.filter((_, i) => i !== index));
  };

  const itemsSubtotal = purchaseItems.reduce((acc, itm) => {
    return acc + (parseFloat(itm.quantity || 0) * parseFloat(itm.purchasePrice || 0));
  }, 0);

  const grandTotal = Math.max(0, itemsSubtotal - (parseFloat(discountAmount) || 0));

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('يرجى إضافة أصناف إلى فاتورة المشتريات');
      return;
    }

    try {
      const payload = {
        supplierId,
        invoiceDate,
        items: purchaseItems,
        discountAmount: parseFloat(discountAmount) || 0,
        taxAmount: 0,
        paidAmount: parseFloat(paidAmount) || 0,
        notes
      };

      const res = await api.post('/purchases', payload);
      alert(res.message || 'تم حفظ فاتورة المشتريات وإضافة البضاعة للمخزن بنجاح');
      setShowAddModal(false);
      loadPurchases();
    } catch (err) {
      alert(err.message || 'فشل حفظ فاتورة المشتريات');
    }
  };

  const viewPurchaseDetails = async (id) => {
    try {
      const res = await api.get(`/purchases/${id}`);
      setSelectedPurchase(res);
    } catch (e) {
      alert('فشل تحميل تفاصيل الفاتورة');
    }
  };

  const columns = [
    {
      key: 'id',
      label: '#',
      width: '45px',
      minWidth: '45px',
      align: 'center',
      className: 'num-mono',
      render: (_, idx) => idx + 1
    },
    {
      key: 'invoice_number',
      label: 'رقم الفاتورة',
      minWidth: '130px',
      className: 'num-mono',
      render: p => <span style={{ fontWeight: 800 }}>{p.invoice_number}</span>
    },
    {
      key: 'supplier_name',
      label: 'اسم المورد',
      minWidth: '220px',
      render: p => <span style={{ fontWeight: 700 }}>{p.supplier_name}</span>
    },
    {
      key: 'invoice_date',
      label: 'تاريخ التوريد',
      minWidth: '110px',
      className: 'num-mono',
      render: p => p.invoice_date
    },
    {
      key: 'items_count',
      label: 'عدد الأصناف',
      minWidth: '85px',
      align: 'center',
      className: 'num-mono',
      render: p => p.items_count
    },
    {
      key: 'grand_total',
      label: 'إجمالي الفاتورة',
      minWidth: '120px',
      className: 'num-mono',
      render: p => <span style={{ fontWeight: 700 }}>{parseFloat(p.grand_total).toFixed(2)} ج.م</span>
    },
    {
      key: 'paid_amount',
      label: 'المدفوع نقداً',
      minWidth: '110px',
      className: 'num-mono',
      render: p => <span style={{ color: '#15803d' }}>{parseFloat(p.paid_amount).toFixed(2)} ج.م</span>
    },
    {
      key: 'remaining_amount',
      label: 'المتبقي (آجل)',
      minWidth: '110px',
      className: 'num-mono',
      render: p => (
        <span style={{ color: parseFloat(p.remaining_amount) > 0 ? '#b71c1c' : 'inherit', fontWeight: 700 }}>
          {parseFloat(p.remaining_amount).toFixed(2)} ج.م
        </span>
      )
    },
    {
      key: 'payment_status',
      label: 'حالة السداد',
      minWidth: '100px',
      align: 'center',
      render: p => (
        <span
          className={`badge ${
            p.payment_status === 'paid'
              ? 'badge-success'
              : p.payment_status === 'partial'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {p.payment_status === 'paid' && 'مسددة بالكامل'}
          {p.payment_status === 'partial' && 'سداد جزئي'}
          {p.payment_status === 'unpaid' && 'آجلة بالكامل'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'معاينة الأصناف',
      minWidth: '120px',
      align: 'center',
      render: p => (
        <button
          className="btn btn-sm"
          style={{ padding: '2px 6px' }}
          onClick={(e) => { e.stopPropagation(); viewPurchaseDetails(p.id); }}
        >
          <Eye size={12} />
          <span>عرض الأصناف</span>
        </button>
      )
    }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      <div
        className="pos-toolbar"
        style={{
          background: '#ffffff',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={18} style={{ color: '#234e70' }} />
          <h2 style={{ fontSize: '15px' }}>إدارة فواتير المشتريات وتوريد البضاعة</h2>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={loadPurchases}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>تسجيل فاتورة توريد / مشتريات جديدة</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        emptyMessage="لا توجد فواتير مشتريات مسجلة"
        rowKey={p => p.id}
      />

      {/* Add Purchase Invoice Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <span>تسجيل فاتورة توريد مشتريات بضاعة جديدة</span>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSavePurchase} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label>اختر المورد (*):</label>
                    <select
                      required
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.company || 'مورد'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>تاريخ الفاتورة:</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Items in Purchase Invoice */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>أصناف فاتورة التوريد:</span>
                  <button type="button" className="btn btn-sm btn-primary" onClick={addPurchaseRow}>
                    <Plus size={12} />
                    <span>إضافة صنف للفاتورة</span>
                  </button>
                </div>

                <div className="table-container" style={{ maxHeight: '240px', marginBottom: '10px' }}>
                  <table className="dense-table">
                    <thead>
                      <tr>
                        <th>الصنف</th>
                        <th style={{ width: '110px' }}>الكمية</th>
                        <th style={{ width: '110px' }}>سعر الشراء</th>
                        <th style={{ width: '120px' }}>الإجمالي</th>
                        <th style={{ width: '40px' }}>حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>اضغط على "إضافة صنف" لإدراج أصناف الفاتورة</td></tr>
                      ) : (
                        purchaseItems.map((row, idx) => (
                          <tr key={idx}>
                            <td>
                              <ProductSearchSelect
                                products={products}
                                value={row.productId}
                                onChange={(val) => updatePurchaseRow(idx, 'productId', val)}
                                renderLabel={(p) => `${p.name} (${p.barcode || '---'})`}
                                style={{ width: '100%' }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                value={row.quantity}
                                onChange={(e) => updatePurchaseRow(idx, 'quantity', e.target.value)}
                                style={{ width: '100%', textAlign: 'center', fontWeight: 700 }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                value={row.purchasePrice}
                                onChange={(e) => updatePurchaseRow(idx, 'purchasePrice', e.target.value)}
                                style={{ width: '100%', textAlign: 'center' }}
                              />
                            </td>
                            <td className="num-mono" style={{ fontWeight: 700 }}>
                              {(parseFloat(row.quantity || 0) * parseFloat(row.purchasePrice || 0)).toFixed(2)} ج.م
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                style={{ padding: '2px 5px' }}
                                onClick={() => removePurchaseRow(idx)}
                              >
                                <Trash2 size={11} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Summary & Payment */}
                <div className="form-row">
                  <div className="form-group">
                    <label>الخصم الممنوح من المورد:</label>
                    <input
                      type="number"
                      step="any"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>المدفوع نقداً للمورد الآن:</label>
                    <input
                      type="number"
                      step="any"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    padding: '8px 14px',
                    borderRadius: '3px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '6px'
                  }}
                >
                  <div>
                    إجمالي الفاتورة: <strong className="num-mono" style={{ fontSize: '15px' }}>{grandTotal.toFixed(2)} ج.م</strong>
                  </div>
                  <div style={{ color: grandTotal - (parseFloat(paidAmount) || 0) > 0 ? '#b71c1c' : '#15803d' }}>
                    المتبقي لحساب المورد (آجل): <strong className="num-mono" style={{ fontSize: '15px' }}>
                      {Math.max(0, grandTotal - (parseFloat(paidAmount) || 0)).toFixed(2)} ج.م
                    </strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={14} />
                  <span>تأكيد الفاتورة وإضافة البضاعة للمخزن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedPurchase && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px', maxHeight: '80vh' }}>
            <div className="modal-header">
              <span>تفاصيل فاتورة مشتريات: {selectedPurchase.invoice_number}</span>
              <button className="close-btn" onClick={() => setSelectedPurchase(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', background: '#f8fafc', padding: '8px' }}>
                <div>المورد: <strong>{selectedPurchase.supplier_name}</strong></div>
                <div>تاريخ التوريد: <span className="num-mono">{selectedPurchase.invoice_date}</span></div>
                <div>الحالة: <strong>{selectedPurchase.payment_status}</strong></div>
              </div>

              <div className="table-container" style={{ maxHeight: '250px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>اسم المنتج</th>
                      <th>الكمية المستلمة</th>
                      <th>سعر الشراء</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items?.map((item, i) => (
                      <tr key={item.id}>
                        <td className="num-mono">{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{item.product_name}</td>
                        <td className="num-mono" style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                        <td className="num-mono">{parseFloat(item.purchase_price).toFixed(2)} ج.م</td>
                        <td className="num-mono" style={{ fontWeight: 700 }}>{parseFloat(item.total).toFixed(2)} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPurchase(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
