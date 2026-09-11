import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, FileText, DollarSign, RefreshCw, X, Check } from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';

export default function CustomersView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementData, setStatementData] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payCustomer, setPayCustomer] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payNotes, setPayNotes] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    creditLimit: '5000',
    notes: ''
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      setCustomers(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditCustomer(null);
    setFormData({ name: '', phone: '', address: '', creditLimit: '5000', notes: '' });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone || '',
      address: c.address || '',
      creditLimit: c.credit_limit.toString(),
      notes: c.notes || ''
    });
    setShowAddEditModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (editCustomer) {
        await api.put(`/customers/${editCustomer.id}`, formData);
        alert('تم تعديل بيانات العميل بنجاح');
      } else {
        await api.post('/customers', formData);
        alert('تمت إضافة العميل بنجاح');
      }
      setShowAddEditModal(false);
      loadCustomers();
    } catch (err) {
      alert(err.message || 'فشل حفظ بيانات العميل');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`هل أنت متأكد من حذف العميل "${c.name}"؟`)) return;
    try {
      await api.delete(`/customers/${c.id}`);
      alert('تم حذف العميل');
      loadCustomers();
    } catch (err) {
      alert(err.message || 'فشل حذف العميل');
    }
  };

  const handleOpenStatement = async (c) => {
    try {
      const res = await api.get(`/customers/${c.id}/statement`);
      setStatementData(res);
      setShowStatementModal(true);
    } catch (e) {
      alert('فشل تحميل كشف الحساب');
    }
  };

  const handleOpenPay = (c) => {
    setPayCustomer(c);
    setPayAmount('');
    setPayMethod('cash');
    setPayNotes('سداد دفعة من الحساب الآجل');
    setShowPayModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/customers/${payCustomer.id}/pay`, {
        amount: payAmount,
        paymentMethod: payMethod,
        notes: payNotes
      });
      alert('تم تسجيل سند القبض وتحديث مديونية العميل بنجاح');
      setShowPayModal(false);
      loadCustomers();
    } catch (err) {
      alert(err.message || 'فشل تسجيل السداد');
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
      key: 'name',
      label: 'اسم العميل',
      minWidth: '200px',
      render: c => <span style={{ fontWeight: 700 }}>{c.name}</span>
    },
    {
      key: 'phone',
      label: 'رقم الهاتف',
      minWidth: '120px',
      className: 'num-mono',
      render: c => c.phone || '-'
    },
    {
      key: 'address',
      label: 'العنوان',
      minWidth: '160px',
      render: c => c.address || '-'
    },
    {
      key: 'balance',
      label: 'الرصيد المدين (المستحق)',
      minWidth: '130px',
      className: 'num-mono',
      render: c => (
        <span style={{ fontWeight: 800, color: c.balance > 0 ? '#b71c1c' : '#15803d' }}>
          {parseFloat(c.balance || 0).toFixed(2)} ج.م
        </span>
      )
    },
    {
      key: 'credit_limit',
      label: 'الحد الائتماني',
      minWidth: '110px',
      className: 'num-mono',
      render: c => `${parseFloat(c.credit_limit || 0).toFixed(2)} ج.م`
    },
    {
      key: 'total_invoices_count',
      label: 'عدد الفواتير',
      minWidth: '85px',
      align: 'center',
      className: 'num-mono',
      render: c => c.total_invoices_count || 0
    },
    {
      key: 'total_purchased',
      label: 'إجمالي المشتريات',
      minWidth: '120px',
      className: 'num-mono',
      render: c => `${parseFloat(c.total_purchased || 0).toFixed(2)} ج.م`
    },
    {
      key: 'last_purchase_date',
      label: 'آخر عملية شراء',
      minWidth: '110px',
      className: 'num-mono',
      render: c => (
        <span style={{ fontSize: '11px' }}>
          {c.last_purchase_date ? new Date(c.last_purchase_date).toLocaleDateString('ar-EG') : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'إجراءات الحساب',
      minWidth: '170px',
      align: 'center',
      render: c => (
        <div style={{ display: 'inline-flex', gap: '4px' }}>
          <button
            className="btn btn-sm btn-success"
            style={{ padding: '2px 6px' }}
            title="سند قبض تحصيل نقدية"
            onClick={(e) => { e.stopPropagation(); handleOpenPay(c); }}
          >
            <DollarSign size={12} />
            <span>تحصيل</span>
          </button>
          <button
            className="btn btn-sm"
            style={{ padding: '2px 6px' }}
            title="كشف حساب عميل"
            onClick={(e) => { e.stopPropagation(); handleOpenStatement(c); }}
          >
            <FileText size={12} />
            <span>كشف حساب</span>
          </button>
          <button
            className="btn btn-sm"
            style={{ padding: '2px 6px' }}
            title="تعديل"
            onClick={(e) => { e.stopPropagation(); handleOpenEdit(c); }}
          >
            <Edit2 size={12} />
          </button>
          <button
            className="btn btn-sm btn-danger"
            style={{ padding: '2px 6px' }}
            title="حذف"
            onClick={(e) => { e.stopPropagation(); handleDelete(c); }}
          >
            <Trash2 size={12} />
          </button>
        </div>
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
          <Users size={18} style={{ color: '#234e70' }} />
          <h2 style={{ fontSize: '15px' }}>دليل العملاء وحسابات البيع الآجل</h2>
          <span className="badge badge-navy">إجمالي العملاء: {customers.length}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={loadCustomers}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      <div className="table-container" style={{ flex: 1 }}>
        <table className="dense-table">
          <thead>
            <tr>
              <th style={{ width: '45px', minWidth: '45px', textAlign: 'center' }}>#</th>
              <th style={{ minWidth: '200px' }}>اسم العميل</th>
              <th style={{ minWidth: '120px' }}>رقم الهاتف</th>
              <th style={{ minWidth: '160px' }}>العنوان</th>
              <th style={{ minWidth: '130px' }}>الرصيد المدين (المستحق)</th>
              <th style={{ minWidth: '110px' }}>الحد الائتماني</th>
              <th style={{ minWidth: '85px', textAlign: 'center' }}>عدد الفواتير</th>
              <th style={{ minWidth: '120px' }}>إجمالي المشتريات</th>
              <th style={{ minWidth: '110px' }}>آخر عملية شراء</th>
              <th style={{ minWidth: '170px', textAlign: 'center' }}>إجراءات الحساب</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>جاري التحميل...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>لا يوجد عملاء مسجلين</td></tr>
            ) : (
              customers.map((c, idx) => (
                <tr key={c.id}>
                  <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td className="num-mono">{c.phone || '-'}</td>
                  <td>{c.address || '-'}</td>
                  <td className="num-mono" style={{ fontWeight: 800, color: c.balance > 0 ? '#b71c1c' : '#15803d' }}>
                    {parseFloat(c.balance || 0).toFixed(2)} ج.م
                  </td>
                  <td className="num-mono">{parseFloat(c.credit_limit || 0).toFixed(2)} ج.م</td>
                  <td className="num-mono" style={{ textAlign: 'center' }}>{c.total_invoices_count || 0}</td>
                  <td className="num-mono">{parseFloat(c.total_purchased || 0).toFixed(2)} ج.م</td>
                  <td className="num-mono" style={{ fontSize: '11px' }}>
                    {c.last_purchase_date ? new Date(c.last_purchase_date).toLocaleDateString('ar-EG') : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm btn-success"
                        style={{ padding: '2px 6px' }}
                        title="سند قبض تحصيل نقدية"
                        onClick={() => handleOpenPay(c)}
                      >
                        <DollarSign size={12} />
                        <span>تحصيل</span>
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '2px 6px' }}
                        title="كشف حساب عميل"
                        onClick={() => handleOpenStatement(c)}
                      >
                        <FileText size={12} />
                        <span>كشف حساب</span>
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '2px 6px' }}
                        title="تعديل"
                        onClick={() => handleOpenEdit(c)}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ padding: '2px 6px' }}
                        title="حذف"
                        onClick={() => handleDelete(c)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '480px' }}>
            <div className="modal-header">
              <span>{editCustomer ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'}</span>
              <button className="close-btn" onClick={() => setShowAddEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveCustomer}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم العميل بالكامل (*):</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>رقم الهاتف / الموبايل:</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="num-mono"
                    />
                  </div>
                  <div className="form-group">
                    <label>الحد الائتماني للبيع الآجل (ج.م):</label>
                    <input
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>العنوان بالتفصيل:</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات:</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEditModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">حفظ العميل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Statement Modal */}
      {showStatementModal && statementData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '700px', maxHeight: '85vh' }}>
            <div className="modal-header">
              <span>كشف حساب العميل: {statementData.customer?.name}</span>
              <button className="close-btn" onClick={() => setShowStatementModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', background: '#f8fafc', padding: '10px', borderRadius: '3px' }}>
                <div>الهاتف: <span className="num-mono">{statementData.customer?.phone || '-'}</span></div>
                <div>العنوان: <span>{statementData.customer?.address || '-'}</span></div>
                <div>الرصيد المدين الحالي: <strong className="num-mono" style={{ color: '#b71c1c' }}>{statementData.customer?.balance} ج.م</strong></div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>فواتير المبيعات:</div>
              <div className="table-container" style={{ maxHeight: '180px', marginBottom: '12px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>رقم الفاتورة</th>
                      <th>التاريخ</th>
                      <th>الإجمالي</th>
                      <th>طريقة الدفع</th>
                      <th>المتبقي على الحساب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.invoices?.map(inv => (
                      <tr key={inv.id}>
                        <td className="num-mono">{inv.invoice_number}</td>
                        <td className="num-mono">{new Date(inv.created_at).toLocaleString('ar-EG')}</td>
                        <td className="num-mono">{inv.grand_total} ج.م</td>
                        <td>{inv.payment_method}</td>
                        <td className="num-mono" style={{ color: inv.remaining_amount > 0 ? '#b71c1c' : 'inherit', fontWeight: 700 }}>
                          {inv.remaining_amount} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>سندات القبض والتحصيلات:</div>
              <div className="table-container" style={{ maxHeight: '180px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>تاريخ السداد</th>
                      <th>المبلغ المسدد</th>
                      <th>طريقة السداد</th>
                      <th>البيان والملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.payments?.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>لا توجد دفعات مسددة مسجلة</td></tr>
                    ) : (
                      statementData.payments?.map(pay => (
                        <tr key={pay.id}>
                          <td className="num-mono">{pay.payment_date}</td>
                          <td className="num-mono" style={{ fontWeight: 700, color: '#15803d' }}>{pay.amount} ج.م</td>
                          <td>{pay.payment_method}</td>
                          <td>{pay.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatementModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Debt / Customer Payment Modal */}
      {showPayModal && payCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <span>سند قبض نقدية من العميل: {payCustomer.name}</span>
              <button className="close-btn" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePayment}>
              <div className="modal-body">
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: '3px', marginBottom: '10px', fontWeight: 700 }}>
                  إجمالي المديونية المستحقة: <span className="num-mono">{payCustomer.balance} ج.م</span>
                </div>

                <div className="form-group">
                  <label>المبلغ المحصل والمسدد (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
                  />
                </div>

                <div className="form-group">
                  <label>طريقة القبض:</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                    <option value="cash">نقداً في الدرج (Cash)</option>
                    <option value="visa">فيزا / بطاقة (Visa)</option>
                    <option value="instapay">تحويل إنستاباي (Instapay)</option>
                    <option value="wallet">محفظة إلكترونية (Wallet)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>ملاحظات وسند الإيصال:</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-success">تأكيد تحصيل السند وتخفيض الدين</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
