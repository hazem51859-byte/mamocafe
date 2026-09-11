import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Edit2, Key, Check, X, Shield, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add Form
  const [addForm, setAddForm] = useState({
    username: '',
    password: '',
    fullName: '',
    roleId: '4', // Cashier default
    phone: ''
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    fullName: '',
    roleId: '',
    phone: '',
    isActive: true,
    customPermissions: []
  });

  // Password Reset Form
  const [newPassword, setNewPassword] = useState('');

  const allAvailablePermissions = [
    { id: 'view_dashboard', label: 'عرض لوحة المؤشرات' },
    { id: 'pos_checkout', label: 'إتمام عمليات البيع والفواتير' },
    { id: 'pos_hold_invoice', label: 'تعليق واسترجاع الفواتير' },
    { id: 'pos_apply_discount', label: 'تطبيق خصومات على الفواتير' },
    { id: 'view_products', label: 'عرض دليل المنتجات' },
    { id: 'manage_products', label: 'إضافة وتعديل وحذف المنتجات' },
    { id: 'view_inventory', label: 'عرض أرصدة المخزون' },
    { id: 'manage_inventory', label: 'أذونات الإضافة والصرف المخزني' },
    { id: 'stock_adjustments', label: 'التسويات الجردية' },
    { id: 'view_sales', label: 'عرض فواتير المبيعات' },
    { id: 'sales_returns', label: 'تسجيل مرتجعات المبيعات' },
    { id: 'view_purchases', label: 'عرض فواتير المشتريات' },
    { id: 'manage_purchases', label: 'تسجيل فواتير المشتريات' },
    { id: 'view_suppliers', label: 'عرض حسابات الموردين' },
    { id: 'manage_suppliers', label: 'إدارة وسداد الموردين' },
    { id: 'view_customers', label: 'عرض حسابات العملاء' },
    { id: 'manage_customers', label: 'إدارة وسندات قبض العملاء' },
    { id: 'view_expenses', label: 'عرض المصروفات' },
    { id: 'manage_expenses', label: 'تسجيل المصروفات' },
    { id: 'shifts_manage', label: 'فتح وإغلاق شيفتات الخزينة' },
    { id: 'view_reports', label: 'عرض التقارير والأرباح' },
    { id: 'manage_users', label: 'إدارة المستخدمين والصلاحيات' },
    { id: 'manage_settings', label: 'إدارة إعدادات النظام' },
    { id: 'backup_restore', label: 'النسخ الاحتياطي والاستعادة' }
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.users || []);
      setRoles(res.roles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setAddForm({
      username: '',
      password: '',
      fullName: '',
      roleId: roles[0]?.id || '4',
      phone: ''
    });
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', addForm);
      alert('تم إنشاء المستخدم بنجاح');
      setShowAddModal(false);
      loadUsers();
    } catch (err) {
      alert(err.message || 'فشل إنشاء المستخدم');
    }
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setEditForm({
      fullName: u.full_name,
      roleId: u.role_id,
      phone: u.phone || '',
      isActive: !!u.is_active,
      customPermissions: u.custom_permissions || []
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedUser.id}`, editForm);
      alert('تم تحديث بيانات المستخدم والصلاحيات بنجاح');
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      alert(err.message || 'فشل تحديث المستخدم');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedUser.id}/reset-password`, { newPassword });
      alert('تمت إعادة تعيين كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err) {
      alert(err.message || 'فشل تغيير كلمة المرور');
    }
  };

  const togglePermission = (permId) => {
    setEditForm(prev => {
      const current = prev.customPermissions || [];
      const exists = current.includes(permId);
      return {
        ...prev,
        customPermissions: exists ? current.filter(p => p !== permId) : [...current, permId]
      };
    });
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
          <UserCog size={18} style={{ color: '#234e70' }} />
          <h2 style={{ fontSize: '15px' }}>إدارة مستخدمي النظام وأدوار الصلاحيات (RBAC)</h2>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={loadUsers}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
            <Plus size={14} />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>
      </div>

      <div className="table-container" style={{ flex: 1 }}>
        <table className="dense-table">
          <thead>
            <tr>
              <th style={{ width: '45px', minWidth: '45px', textAlign: 'center' }}>#</th>
              <th style={{ minWidth: '150px' }}>اسم المستخدم (Login)</th>
              <th style={{ minWidth: '180px' }}>الاسم بالكامل</th>
              <th style={{ minWidth: '140px' }}>الدور الوظيفي (Role)</th>
              <th style={{ minWidth: '120px' }}>رقم الهاتف</th>
              <th style={{ minWidth: '90px', textAlign: 'center' }}>الحالة</th>
              <th style={{ minWidth: '120px' }}>تاريخ الإنشاء</th>
              <th style={{ minWidth: '150px', textAlign: 'center' }}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>جاري التحميل...</td></tr>
            ) : (
              users.map((u, idx) => (
                <tr key={u.id}>
                  <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td className="num-mono" style={{ fontWeight: 800 }}>{u.username}</td>
                  <td style={{ fontWeight: 700 }}>{u.full_name}</td>
                  <td>
                    <span className="badge badge-navy">{u.role_display}</span>
                  </td>
                  <td className="num-mono">{u.phone || '-'}</td>
                  <td>
                    {u.is_active ? (
                      <span className="badge badge-success">نشط</span>
                    ) : (
                      <span className="badge badge-danger">معطل</span>
                    )}
                  </td>
                  <td className="num-mono" style={{ fontSize: '11px' }}>
                    {new Date(u.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '2px 6px' }}
                        title="تعديل البيانات والصلاحيات"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <Edit2 size={12} />
                        <span>تعديل</span>
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '2px 6px' }}
                        title="تغيير كلمة المرور"
                        onClick={() => {
                          setSelectedUser(u);
                          setNewPassword('');
                          setShowPasswordModal(true);
                        }}
                      >
                        <Key size={12} />
                        <span>كلمة السر</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px' }}>
            <div className="modal-header">
              <span>إضافة مستخدم جديد للنظام</span>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم المستخدم للوجين (*):</label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="مثال: cashier3"
                    className="num-mono"
                  />
                </div>

                <div className="form-group">
                  <label>كلمة المرور الافتتاحية (*):</label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>الاسم بالكامل (*):</label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    placeholder="مثال: حسام محمد علي"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>الدور الوظيفي (*):</label>
                    <select
                      value={addForm.roleId}
                      onChange={(e) => setAddForm({ ...addForm, roleId: e.target.value })}
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.display_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>رقم الهاتف:</label>
                    <input
                      type="text"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      className="num-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">إنشاء المستخدم</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User & Permissions Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '650px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <span>تعديل المستخدم والصلاحيات: {selectedUser.username}</span>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto' }}>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label>الاسم بالكامل:</label>
                    <input
                      type="text"
                      required
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>الدور الأساسي:</label>
                    <select
                      value={editForm.roleId}
                      onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.display_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>رقم الهاتف:</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="num-mono"
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                    <input
                      type="checkbox"
                      id="activeCheck"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    />
                    <label htmlFor="activeCheck" style={{ cursor: 'pointer', fontWeight: 700 }}>
                      الحساب نشط ومصرح له بالدخول
                    </label>
                  </div>
                </div>

                {/* Granular Permissions Checklist */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                    تخصيص الصلاحيات الإضافية (Permissions Checklist):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                    {allAvailablePermissions.map(p => {
                      const checked = editForm.customPermissions?.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11.5px',
                            background: checked ? '#e0f2fe' : '#f8fafc',
                            padding: '4px 8px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '2px',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(p.id)}
                          />
                          <span>{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">حفظ التغييرات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '380px' }}>
            <div className="modal-header">
              <span>تغيير كلمة المرور: {selectedUser.username}</span>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <div className="form-group">
                  <label>كلمة المرور الجديدة (*):</label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="4 خانات على الأقل..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">تحديث كلمة المرور</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
