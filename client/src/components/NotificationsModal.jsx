import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Clock, PackageCheck } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationsModal({ onClose, onNavigate }) {
  const [activeTab, setActiveTab] = useState('lowStock');
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const lowRes = await api.get('/products', { lowStock: '1', limit: 50 });
        const expRes = await api.get('/products', { expired: '1', limit: 50 });
        setLowStockItems(lowRes.products || []);
        setExpiredItems(expRes.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '680px', maxHeight: '85vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={17} style={{ color: '#f59e0b' }} />
            <span>مركز التنبيهات والنواقص الإدارية</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderBottom: '1px solid #cbd5e1' }}>
          <button
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 0,
              border: 'none',
              background: activeTab === 'lowStock' ? '#ffffff' : 'transparent',
              fontWeight: activeTab === 'lowStock' ? 700 : 500,
              borderBottom: activeTab === 'lowStock' ? '2px solid #b45309' : 'none',
              boxShadow: 'none',
              color: activeTab === 'lowStock' ? '#b45309' : '#475569'
            }}
            onClick={() => setActiveTab('lowStock')}
          >
            نواقص المخزون ({lowStockItems.length})
          </button>
          <button
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 0,
              border: 'none',
              background: activeTab === 'expired' ? '#ffffff' : 'transparent',
              fontWeight: activeTab === 'expired' ? 700 : 500,
              borderBottom: activeTab === 'expired' ? '2px solid #b71c1c' : 'none',
              boxShadow: 'none',
              color: activeTab === 'expired' ? '#b71c1c' : '#475569'
            }}
            onClick={() => setActiveTab('expired')}
          >
            أصناف منتهية الصلاحية ({expiredItems.length})
          </button>
        </div>

        <div className="modal-body" style={{ padding: '10px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>جاري التحميل...</div>
          ) : activeTab === 'lowStock' ? (
            lowStockItems.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#15803d' }}>
                <PackageCheck size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                لا توجد نواقص حالياً، جميع الأصناف فوق حد الأمان المخزني.
              </div>
            ) : (
              <div className="table-container">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>اسم المنتج</th>
                      <th>الباركود</th>
                      <th>الرصيد الحالي</th>
                      <th>حد الطلب</th>
                      <th>المورد</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td className="num-mono">{p.barcode}</td>
                        <td className="num-mono" style={{ color: '#b71c1c', fontWeight: 700 }}>
                          {p.stock_quantity} {p.unit}
                        </td>
                        <td className="num-mono">{p.min_stock_alert} {p.unit}</td>
                        <td>{p.supplier_name || 'عام'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              onClose();
                              onNavigate('purchases');
                            }}
                          >
                            طلب شراء
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            expiredItems.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#15803d' }}>
                <PackageCheck size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                لا توجد أصناف منتهية الصلاحية مسجلة حالياً.
              </div>
            ) : (
              <div className="table-container">
                <table className="dense-table">
                  <thead>
                    <tr>
                      <th>اسم المنتج</th>
                      <th>الباركود</th>
                      <th>الكمية بالمخزن</th>
                      <th>تاريخ الصلاحية</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredItems.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td className="num-mono">{p.barcode}</td>
                        <td className="num-mono" style={{ color: '#b71c1c', fontWeight: 700 }}>
                          {p.stock_quantity} {p.unit}
                        </td>
                        <td className="num-mono" style={{ color: '#b71c1c' }}>
                          {p.expiry_date}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              onClose();
                              onNavigate('inventory');
                            }}
                          >
                            إعدام تالف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
