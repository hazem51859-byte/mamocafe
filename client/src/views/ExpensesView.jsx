import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, RefreshCw, X, Check, PieChart } from 'lucide-react';
import { api } from '../services/api';

export default function ExpensesView() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    category: 'نثريات وضيافة',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    employeeName: '',
    notes: '',
    deductFromShift: true
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', {
        category: categoryFilter,
        startDate,
        endDate
      });
      setExpenses(res.expenses || []);
      setSummary(res.summary || null);
      setByCategory(res.byCategory || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [categoryFilter, startDate, endDate]);

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', formData);
      alert('تم تسجيل المصروف بنجاح وخصمه من نقدية الشيفت');
      setShowAddModal(false);
      setFormData({
        category: 'نثريات وضيافة',
        amount: '',
        expenseDate: new Date().toISOString().slice(0, 10),
        employeeName: '',
        notes: '',
        deductFromShift: true
      });
      loadExpenses();
    } catch (err) {
      alert(err.message || 'فشل حفظ المصروف');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await api.delete(`/expenses/${id}`);
      alert('تم حذف المصروف');
      loadExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {/* Top Filter Bar */}
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
          <Wallet size={18} style={{ color: '#b71c1c' }} />
          <h2 style={{ fontSize: '15px' }}>إدارة المصروفات والنثريات اليومية</h2>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px', fontSize: '12px' }}
          >
            <option value="">جميع بنود المصروفات</option>
            <option value="إيجار المحل">إيجار المحل</option>
            <option value="كهرباء وإنارة">كهرباء وإنارة</option>
            <option value="رواتب وأجور">رواتب وأجور</option>
            <option value="مستلزمات تغليف وفواتير">مستلزمات تغليف وفواتير</option>
            <option value="صيانة ونظافة">صيانة ونظافة</option>
            <option value="نقل ومشالات">نقل ومشالات</option>
            <option value="نثريات وضيافة">نثريات وضيافة</option>
            <option value="أخرى">أخرى</option>
          </select>

          <button className="btn btn-sm" onClick={loadExpenses}>
            <RefreshCw size={12} />
            <span>تحديث</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {summary && (
            <div style={{ fontSize: '13px' }}>
              إجمالي المصروفات: <strong className="num-mono" style={{ color: '#b71c1c' }}>
                {parseFloat(summary.total_amount || 0).toFixed(2)} ج.م
              </strong>
            </div>
          )}
          <button className="btn btn-sm btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', gap: '8px', overflow: 'hidden' }}>
        {/* Expenses Table */}
        <div className="table-container" style={{ height: '100%' }}>
          <table className="dense-table">
            <thead>
              <tr>
                <th style={{ width: '45px', minWidth: '45px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '150px' }}>بند المصروف</th>
                <th style={{ minWidth: '110px' }}>المبلغ</th>
                <th style={{ minWidth: '110px' }}>التاريخ</th>
                <th style={{ minWidth: '110px' }}>الشيفت المرتبط</th>
                <th style={{ minWidth: '140px' }}>المسؤول / الموظف</th>
                <th style={{ minWidth: '180px' }}>البيان والملاحظات</th>
                <th style={{ width: '60px', minWidth: '60px', textAlign: 'center' }}>حذف</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>جاري التحميل...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>لا توجد مصروفات مسجلة</td></tr>
              ) : (
                expenses.map((e, idx) => (
                  <tr key={e.id}>
                    <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700 }}>{e.category}</td>
                    <td className="num-mono" style={{ fontWeight: 800, color: '#b71c1c' }}>
                      {parseFloat(e.amount).toFixed(2)} ج.م
                    </td>
                    <td className="num-mono">{e.expense_date}</td>
                    <td className="num-mono">
                      {e.shift_id ? <span className="badge badge-navy">شيفت #{e.shift_id}</span> : '-'}
                    </td>
                    <td>{e.employee_name || '-'}</td>
                    <td>{e.notes || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ padding: '2px 5px' }}
                        onClick={() => handleDeleteExpense(e.id)}
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

        {/* Category Breakdown Sidebar */}
        <div className="pos-panel" style={{ height: '100%' }}>
          <div className="pos-panel-header">
            <span>توزيع المصروفات حسب البند</span>
          </div>
          <div style={{ padding: '8px', overflowY: 'auto' }}>
            {byCategory.map((cat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              >
                <span>{cat.category}</span>
                <strong className="num-mono" style={{ color: '#b71c1c' }}>
                  {parseFloat(cat.total).toFixed(2)} ج.م
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '420px' }}>
            <div className="modal-header">
              <span>تسجيل مصروف جديد</span>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveExpense}>
              <div className="modal-body">
                <div className="form-group">
                  <label>بند المصروف (*):</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="نثريات وضيافة">نثريات وضيافة وبوفيه</option>
                    <option value="مستلزمات تغليف وفواتير">مستلزمات تغليف وأكياس وورق حراري</option>
                    <option value="صيانة ونظافة">صيانة ومواد نظافة</option>
                    <option value="كهرباء وإنارة">فواتير كهرباء ومياه</option>
                    <option value="إيجار المحل">إيجار المحل / المخزن</option>
                    <option value="رواتب وأجور">سلف ورواتب عمالة</option>
                    <option value="نقل ومشالات">نقل وتفريغ بضاعة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>المبلغ المدفوع (ج.م) (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
                  />
                </div>

                <div className="form-group">
                  <label>اسم الموظف / المستلم:</label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    placeholder="اسم الموظف المسجل للصرف..."
                  />
                </div>

                <div className="form-group">
                  <label>البيان والتفاصيل:</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="شرح سبب المصروف..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    id="deductCheck"
                    checked={formData.deductFromShift}
                    onChange={(e) => setFormData({ ...formData, deductFromShift: e.target.checked })}
                  />
                  <label htmlFor="deductCheck" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
                    خصم هذا المصروف مباشرة من نقدية عهدة الشيفت الحالية
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">حفظ المصروف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
