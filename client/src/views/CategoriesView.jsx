import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Edit2, Trash2, Check, X, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', sortOrder: '0' });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditCategory(null);
    setFormData({ name: '', code: '', sortOrder: '0' });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditCategory(c);
    setFormData({ name: c.name, code: c.code || '', sortOrder: c.sort_order.toString() });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editCategory) {
        await api.put(`/categories/${editCategory.id}`, formData);
        alert('تم تعديل التصنيف بنجاح');
      } else {
        await api.post('/categories', formData);
        alert('تمت إضافة التصنيف بنجاح');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      alert(err.message || 'فشل حفظ التصنيف');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`هل أنت متأكد من حذف التصنيف "${c.name}"؟`)) return;
    try {
      await api.delete(`/categories/${c.id}`);
      alert('تم حذف التصنيف');
      loadCategories();
    } catch (err) {
      alert(err.message || 'فشل حذف التصنيف');
    }
  };

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
          <Boxes size={18} style={{ color: '#234e70' }} />
          <h2 style={{ fontSize: '15px' }}>إدارة أقسام وتصنيفات السوبر ماركت</h2>
          <span className="badge badge-navy">إجمالي الأقسام: {categories.length}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={loadCategories}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>إضافة قسم جديد</span>
          </button>
        </div>
      </div>

      <div className="table-container" style={{ flex: 1 }}>
        <table className="dense-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>اسم القسم / التصنيف</th>
              <th>الكود التعريفي</th>
              <th>ترتيب الظهور</th>
              <th>عدد المنتجات المسجلة</th>
              <th>الحالة</th>
              <th style={{ textAlign: 'center', width: '120px' }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>جاري التحميل...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>لا توجد أقسام مسجلة</td></tr>
            ) : (
              categories.map((c, idx) => (
                <tr key={c.id}>
                  <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td className="num-mono">{c.code || '-'}</td>
                  <td className="num-mono">{c.sort_order}</td>
                  <td className="num-mono">
                    <span className="badge badge-info">{c.products_count || 0} منتج</span>
                  </td>
                  <td>
                    {c.is_active ? (
                      <span className="badge badge-success">مفعل</span>
                    ) : (
                      <span className="badge badge-danger">معطل</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleOpenEdit(c)}
                        title="تعديل"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleDelete(c)}
                        title="حذف"
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <span>{editCategory ? 'تعديل قسم' : 'إضافة قسم جديد'}</span>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم القسم (*):</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: ألبان وجبن"
                  />
                </div>

                <div className="form-group">
                  <label>كود القسم / الرمز:</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="مثال: DAIRY"
                  />
                </div>

                <div className="form-group">
                  <label>ترتيب الظهور في القوائم:</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
