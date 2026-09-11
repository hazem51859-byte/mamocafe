import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, FileText, DollarSign, RefreshCw, X, Check } from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementData, setStatementData] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paySupplier, setPaySupplier] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payNotes, setPayNotes] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    address: '',
    taxNumber: '',
    openingBalance: '0',
    notes: ''
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleOpenAdd = () => {
    setEditSupplier(null);
    setFormData({
      name: '',
      company: '',
      phone: '',
      address: '',
      taxNumber: '',
      openingBalance: '0',
      notes: ''
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditSupplier(s);
    setFormData({
      name: s.name,
      company: s.company || '',
      phone: s.phone || '',
      address: s.address || '',
      taxNumber: s.tax_number || '',
      openingBalance: s.opening_balance.toString(),
      notes: s.notes || ''
    });
    setShowAddEditModal(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier.id}`, formData);
        alert('تم تعديل بيانات المورد بنجاح');
      } else {
        await api.post('/suppliers', formData);
        alert('تمت إضافة المورد بنجاح');
      }
      setShowAddEditModal(false);
      loadSuppliers();
    } catch (err) {
      alert(err.message || 'فشل حفظ المورد');
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`هل أنت متأكد من حذف المورد "${s.name}"؟`)) return;
    try {
      await api.delete(`/suppliers/${s.id}`);
      alert('تم حذف المورد');
      loadSuppliers();
    } catch (err) {
      alert(err.message || 'فشل حذف المورد');
    }
  };

  const handleOpenStatement = async (s) => {
    try {
      const res = await api.get(`/suppliers/${s.id}/statement`);
      setStatementData(res);
      setShowStatementModal(true);
    } catch (e) {
      alert('فشل جلب كشف الحساب');
    }
  };

  const handleOpenPay = (s) => {
    setPaySupplier(s);
    setPayAmount('');
    setPayMethod('cash');
    setPayNotes('سداد دفعة نقدية');
    setShowPayModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/suppliers/${paySupplier.id}/pay`, {
        amount: payAmount,
        paymentMethod: payMethod,
        notes: payNotes
      });
      alert('تم تسجيل سند الصرف وخصم المبلغ من رصيد المورد بنجاح');
      setShowPayModal(false);
      loadSuppliers();
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
      label: 'اسم المورد / الشركة',
      minWidth: '220px',
      render: s => <span style={{ fontWeight: 700 }}>{s.name}</span>
    },
    {
      key: 'company',
      label: 'اسم جهة التوريد',
      minWidth: '130px',
      render: s => s.company || '-'
    },
    {
      key: 'phone',
      label: 'الهاتف',
      minWidth: '120px',
      className: 'num-mono',
      render: s => s.phone || '-'
    },
    {
      key: 'tax_number',
      label: 'الرقم الضريبي',
      minWidth: '130px',
      className: 'num-mono',
      render: s => s.tax_number || '-'
    },
    {
      key: 'total_purchases_count',
      label: 'عدد الفواتير',
      minWidth: '85px',
      align: 'center',
      className: 'num-mono',
      render: s => s.total_purchases_count || 0
    },
    {
      key: 'total_purchases_amount',
      label: 'إجمالي المشتريات',
      minWidth: '130px',
      className: 'num-mono',
      render: s => `${parseFloat(s.total_purchases_amount || 0).toFixed(2)} ج.م`
    },
    {
      key: 'current_balance',
      label: 'الرصيد الحالي المستحق',
      minWidth: '140px',
      className: 'num-mono',
      render: s => (
        <span style={{ fontWeight: 800, color: s.current_balance > 0 ? '#b71c1c' : '#15803d' }}>
          {parseFloat(s.current_balance || 0).toFixed(2)} ج.م
        </span>
      )
    },
    {
      key: 'actions',
      label: 'إجراءات الحساب',
      minWidth: '180px',
      align: 'center',
      render: s => (
        <div style={{ display: 'inline-flex', gap: '4px' }}>
          <button
            className="btn btn-sm btn-success"
            style={{ padding: '2px 6px' }}
            title="سند صرف وسداد دفعة"
            onClick={(e) => { e.stopPropagation(); handleOpenPay(s); }}
          >
            <DollarSign size={12} />
            <span>سداد</span>
          </button>
          <button
            className="btn btn-sm"
            style={{ padding: '2px 6px' }}
            title="كشف حساب تفصيلي"
            onClick={(e) => { e.stopPropagation(); handleOpenStatement(s); }}
          >
            <FileText size={12} />
            <span>كشف حساب</span>
          </button>
          <button
            className="btn btn-sm"
            style={{ padding: '2px 6px' }}
            title="تعديل"
            onClick={(e) => { e.stopPropagation(); handleOpenEdit(s); }}
          >
            <Edit2 size={12} />
          </button>
          <button
            className="btn btn-sm btn-danger"
            style={{ padding: '2px 6px' }}
            title="حذف"
            onClick={(e) => { e.stopPropagation(); handleDelete(s); }}
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
          <Truck size={18} style={{ color: '#234e70' }} />
          <h2 style={{ fontSize: '15px' }}>دليل الموردين وحسابات الشركات الموردة</h2>
          <span className="badge badge-navy">إجمالي الموردين: {suppliers.length}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={loadSuppliers}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        emptyMessage="لا يوجد موردين مسجلين"
        rowKey={s => s.id}
      />

      {/* Add / Edit Supplier Modal */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '500px' }}>
            <div className="modal-header">
              <span>{editSupplier ? 'تعديل بيانات مورد' : 'إضافة مورد جديد'}</span>
              <button className="close-btn" onClick={() => setShowAddEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveSupplier}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم المورد / المسؤول (*):</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>الشركة / المؤسسة:</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>رقم الهاتف:</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="num-mono"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>الرقم الضريبي:</label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      className="num-mono"
                    />
                  </div>
                  {!editSupplier && (
                    <div className="form-group">
                      <label>الرصيد الافتتاحي (دائن للمورد):</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>العنوان:</label>
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
                <button type="submit" className="btn btn-primary">حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Statement Modal */}
      {showStatementModal && statementData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '700px', maxHeight: '85vh' }}>
            <div className="modal-header">
              <span>كشف حساب المورد: {statementData.supplier?.name}</span>
              <button className="close-btn" onClick={() => setShowStatementModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', background: '#f8fafc', padding: '10px', borderRadius: '3px' }}>
                <div>الشركة: <strong>{statementData.supplier?.company || '-'}</strong></div>
                <div>الهاتف: <span className="num-mono">{statementData.supplier?.phone || '-'}</span></div>
                <div>الرصيد الحالي المستحق: <strong className="num-mono" style={{ color: '#b71c1c' }}>{statementData.supplier?.current_balance} ج.م</strong></div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>فواتير التوريد والمشتريات:</div>
              <div className="table-container" style={{ maxHeight: '180px', marginBottom: '12px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>رقم الفاتورة</th>
                      <th>التاريخ</th>
                      <th>الإجمالي</th>
                      <th>المدفوع</th>
                      <th>المتبقي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.purchases?.map(p => (
                      <tr key={p.id}>
                        <td className="num-mono">{p.invoice_number}</td>
                        <td className="num-mono">{p.invoice_date}</td>
                        <td className="num-mono">{p.grand_total} ج.م</td>
                        <td className="num-mono">{p.paid_amount} ج.م</td>
                        <td className="num-mono" style={{ color: p.remaining_amount > 0 ? '#b71c1c' : 'inherit' }}>{p.remaining_amount} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>سندات الصرف والدفعات المسددة:</div>
              <div className="table-container" style={{ maxHeight: '180px' }}>
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>تاريخ السداد</th>
                      <th>المبلغ المسدد</th>
                      <th>طريقة السداد</th>
                      <th>ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.payments?.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>لا توجد سندات صرف مسجلة</td></tr>
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
              <button className="btn btn-secondary" onClick={() => setShowStatementModal(false)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {showPayModal && paySupplier && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <span>سند صرف نقدية للمورد: {paySupplier.name}</span>
              <button className="close-btn" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePayment}>
              <div className="modal-body">
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: '3px', marginBottom: '10px', fontWeight: 700 }}>
                  الرصيد المستحق حالياً: <span className="num-mono">{paySupplier.current_balance} ج.م</span>
                </div>

                <div className="form-group">
                  <label>المبلغ المراد صرفه وسداده (ج.م) (*):</label>
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
                  <label>طريقة الدفع:</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                    <option value="cash">نقداً من الخزينة (Cash)</option>
                    <option value="bank">تحويل بنكي (Bank Transfer)</option>
                    <option value="check">شيك بنكي (Cheque)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>البيان والملاحظات:</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-success">تأكيد الصرف وتخفيض الرصيد</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
