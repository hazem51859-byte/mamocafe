import React, { useState, useEffect } from 'react';
import {
  Archive,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sliders,
  ClipboardList,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import ProductSearchSelect from '../components/ProductSearchSelect';

export default function InventoryView() {
  const [activeSubTab, setActiveSubTab] = useState('movements'); // 'movements', 'audit'
  const [summary, setSummary] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [inData, setInData] = useState({ productId: '', quantity: '', reason: 'توريد إضافي' });
  const [outData, setOutData] = useState({ productId: '', quantity: '', type: 'damage', reason: 'تالف وكسر' });

  // Physical Audit Tool State
  const [auditItems, setAuditItems] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');

  const loadSummary = async () => {
    try {
      const res = await api.get('/inventory/summary');
      setSummary(res);
    } catch (e) {}
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/movements', {
        type: filterType,
        startDate: filterDate,
        limit: 100
      });
      setMovements(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsForAudit = async () => {
    try {
      const res = await api.get('/products', { limit: 100 });
      setProductsList(res.products || []);
      setAuditItems(
        (res.products || []).map(p => ({
          productId: p.id,
          name: p.name,
          barcode: p.barcode,
          unit: p.unit,
          systemQty: p.stock_quantity,
          actualQty: p.stock_quantity,
          reason: 'جرد دوري'
        }))
      );
    } catch (e) {}
  };

  useEffect(() => {
    loadSummary();
    loadMovements();
    loadProductsForAudit();
  }, [filterType, filterDate]);

  const handleStockInSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/stock-in', inData);
      alert('تم تسجيل إذن الإضافة وتحديث المخزون بنجاح');
      setShowStockInModal(false);
      setInData({ productId: '', quantity: '', reason: 'توريد إضافي' });
      loadSummary();
      loadMovements();
    } catch (err) {
      alert(err.message || 'فشل إذن الإضافة');
    }
  };

  const handleStockOutSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/stock-out', outData);
      alert('تم تسجيل إذن الصرف وخصم الكمية بنجاح');
      setShowStockOutModal(false);
      setOutData({ productId: '', quantity: '', type: 'damage', reason: 'تالف وكسر' });
      loadSummary();
      loadMovements();
    } catch (err) {
      alert(err.message || 'فشل إذن الصرف');
    }
  };

  const handleSaveAudit = async () => {
    if (!window.confirm('هل تريد اعتماد نتائج الجرد الفعلي وتسوية كافة الفروقات تلقائياً؟')) return;
    try {
      const changed = auditItems.filter(i => parseFloat(i.actualQty) !== parseFloat(i.systemQty));
      if (changed.length === 0) {
        alert('لم يتم رصد أي فروقات بين الجرد الفعلي والدفتري.');
        return;
      }
      const res = await api.post('/inventory/audit-count', {
        items: changed.map(c => ({
          productId: c.productId,
          actualQuantity: c.actualQty,
          reason: c.reason
        }))
      });
      alert(res.message || 'تم اعتماد الجرد بنجاح');
      loadSummary();
      loadMovements();
      loadProductsForAudit();
    } catch (err) {
      alert(err.message || 'فشل حفظ الجرد');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      {/* Inventory Summary Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginBottom: '10px'
        }}
      >
        <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #234e70' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>إجمالي تقييم المخزون (بالتكلفة):</div>
          <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#162433' }}>
            {parseFloat(summary?.valuation_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
          </div>
        </div>

        <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #15803d' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>قيمة البيع المتوقعة:</div>
          <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#15803d' }}>
            {parseFloat(summary?.valuation_retail || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
          </div>
        </div>

        <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #475569' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>إجمالي القطع والوحدات:</div>
          <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800 }}>
            {summary?.total_units || 0} وحدة
          </div>
        </div>

        <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #b45309' }}>
          <div style={{ fontSize: '11px', color: '#b45309' }}>أصناف دون حد الأمان:</div>
          <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#b45309' }}>
            {summary?.low_stock || 0} صنف
          </div>
        </div>

        <div className="pos-panel" style={{ padding: '8px 12px', borderTop: '3px solid #b71c1c' }}>
          <div style={{ fontSize: '11px', color: '#b71c1c' }}>منتهي الصلاحية:</div>
          <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#b71c1c' }}>
            {summary?.expired_count || 0} صنف
          </div>
        </div>
      </div>

      {/* Sub Tabs & Actions Toolbar */}
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
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`btn btn-sm ${activeSubTab === 'movements' ? 'btn-primary' : ''}`}
            onClick={() => setActiveSubTab('movements')}
          >
            سجل حركات المخزون (History)
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === 'audit' ? 'btn-primary' : ''}`}
            onClick={() => setActiveSubTab('audit')}
          >
            <ClipboardList size={13} />
            <span>أداة الجرد الدوري والتسوية</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm btn-success" onClick={() => setShowStockInModal(true)}>
            <ArrowDownToLine size={13} />
            <span>إذن إضافة مخزني (Stock In)</span>
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => setShowStockOutModal(true)}>
            <ArrowUpFromLine size={13} />
            <span>إذن صرف وتالف (Stock Out)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'movements' ? (
        <div className="pos-panel" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="pos-toolbar" style={{ background: '#f8fafc', padding: '6px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ width: '160px', fontSize: '12px' }}
              >
                <option value="">جميع أنواع الحركات</option>
                <option value="sale">مبيعات</option>
                <option value="return">مرتجع مبيعات</option>
                <option value="purchase">مشتريات وتوريد</option>
                <option value="adjustment_in">تسوية إضافة</option>
                <option value="adjustment_out">تسوية خصم</option>
                <option value="damage">توالف وهالك</option>
                <option value="expired">منتهي الصلاحية</option>
              </select>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ fontSize: '12px' }}
              />

              <button className="btn btn-sm" onClick={loadMovements}>
                <RefreshCw size={12} />
                <span>تحديث</span>
              </button>
            </div>
          </div>

          <div className="table-container" style={{ flex: 1 }}>
            <table className="dense-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', minWidth: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ minWidth: '220px' }}>اسم الصنف</th>
                  <th style={{ minWidth: '130px' }}>الباركود</th>
                  <th style={{ minWidth: '110px', textAlign: 'center' }}>نوع الحركة</th>
                  <th style={{ minWidth: '100px' }}>الكمية</th>
                  <th style={{ minWidth: '180px' }}>البيان والملاحظات</th>
                  <th style={{ minWidth: '140px' }}>المستخدم المسؤول</th>
                  <th style={{ minWidth: '140px' }}>التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>جاري التحميل...</td></tr>
                ) : movements.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>لا توجد حركات مخزنية مسجلة</td></tr>
                ) : (
                  movements.map((m, idx) => (
                    <tr key={m.id}>
                      <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{m.product_name}</td>
                      <td className="num-mono">{m.product_barcode}</td>
                      <td>
                        <span
                          className={`badge ${
                            m.movement_type === 'sale'
                              ? 'badge-navy'
                              : m.movement_type === 'return' || m.movement_type === 'purchase' || m.movement_type === 'adjustment_in'
                              ? 'badge-success'
                              : 'badge-danger'
                          }`}
                        >
                          {m.movement_type === 'sale' && 'مبيعات'}
                          {m.movement_type === 'return' && 'مرتجع مبيعات'}
                          {m.movement_type === 'purchase' && 'توريد مشتريات'}
                          {m.movement_type === 'adjustment_in' && 'تسوية إضافة'}
                          {m.movement_type === 'adjustment_out' && 'تسوية عجز'}
                          {m.movement_type === 'damage' && 'تالف صالة'}
                          {m.movement_type === 'expired' && 'إعدام صلاحية'}
                          {m.movement_type === 'initial' && 'رصيد افتتاحي'}
                        </span>
                      </td>
                      <td className="num-mono" style={{ fontWeight: 700, direction: 'ltr', textAlign: 'right' }}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.product_unit}
                      </td>
                      <td>{m.notes || '-'}</td>
                      <td>{m.user_full_name || 'النظام'}</td>
                      <td className="num-mono" style={{ fontSize: '11px' }}>
                        {new Date(m.created_at).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Physical Inventory Reconciliation Tool */
        <div className="pos-panel" style={{ flex: 1, overflow: 'hidden' }}>
          <div className="pos-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>أداة الجرد الفعلي الدوري والمطابقة الدفترية</span>
              <span className="badge badge-info">قارن الفعلي بالدفتري واعتمد التسوية بضغطة زر</span>
            </div>
            <button className="btn btn-sm btn-primary" onClick={handleSaveAudit}>
              <Check size={14} />
              <span>اعتماد وتسوية الجرد الآن</span>
            </button>
          </div>

          <div className="table-container" style={{ flex: 1 }}>
            <table className="dense-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم الصنف</th>
                  <th>الباركود</th>
                  <th>الرصيد الدفتري الحالي</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>الرصيد الفعلي المعدود</th>
                  <th>الفارق (عجز / زيادة)</th>
                  <th>سبب التسوية</th>
                </tr>
              </thead>
              <tbody>
                {auditItems.map((item, idx) => {
                  const diff = parseFloat(item.actualQty || 0) - parseFloat(item.systemQty || 0);
                  return (
                    <tr key={item.productId} style={{ background: diff !== 0 ? '#fffbeb' : 'inherit' }}>
                      <td className="num-mono" style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{item.name}</td>
                      <td className="num-mono">{item.barcode}</td>
                      <td className="num-mono" style={{ fontWeight: 700 }}>{item.systemQty} {item.unit}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          step="any"
                          value={item.actualQty}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAuditItems(prev => {
                              const copy = [...prev];
                              copy[idx].actualQty = val;
                              return copy;
                            });
                          }}
                          style={{ width: '80px', textAlign: 'center', fontWeight: 800 }}
                        />
                      </td>
                      <td className="num-mono" style={{ fontWeight: 800, color: diff < 0 ? '#b71c1c' : diff > 0 ? '#15803d' : '#64748b' }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.reason}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAuditItems(prev => {
                              const copy = [...prev];
                              copy[idx].reason = val;
                              return copy;
                            });
                          }}
                          placeholder="سبب الفارق..."
                          style={{ width: '100%', fontSize: '11.5px' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {showStockInModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px' }}>
            <div className="modal-header">
              <span>إذن توريد وإضافة مخزني (Stock In)</span>
              <button className="close-btn" onClick={() => setShowStockInModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleStockInSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اختر المنتج (*):</label>
                  <ProductSearchSelect
                    products={productsList}
                    value={inData.productId}
                    onChange={(val) => setInData({ ...inData, productId: val })}
                    required
                    renderLabel={(p) => `${p.name} (${p.barcode || '---'})`}
                  />
                </div>

                <div className="form-group">
                  <label>الكمية المضافة (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={inData.quantity}
                    onChange={(e) => setInData({ ...inData, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>سبب التوريد / البيان:</label>
                  <input
                    type="text"
                    value={inData.reason}
                    onChange={(e) => setInData({ ...inData, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockInModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-success">تأكيد الإضافة للمخزن</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Out Modal */}
      {showStockOutModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '450px' }}>
            <div className="modal-header">
              <span>إذن صرف وتوالف (Stock Out)</span>
              <button className="close-btn" onClick={() => setShowStockOutModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleStockOutSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اختر المنتج (*):</label>
                  <ProductSearchSelect
                    products={productsList}
                    value={outData.productId}
                    onChange={(val) => setOutData({ ...outData, productId: val })}
                    required
                    renderLabel={(p) => `${p.name} (${p.barcode || '---'})`}
                  />
                </div>

                <div className="form-group">
                  <label>نوع الصرف (*):</label>
                  <select
                    value={outData.type}
                    onChange={(e) => setOutData({ ...outData, type: e.target.value })}
                  >
                    <option value="damage">تالف وكسر صالة (Damaged)</option>
                    <option value="expired">منتهي الصلاحية (Expired)</option>
                    <option value="adjustment_out">صرف إداري / ضيافة</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>الكمية المصروفة (*):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={outData.quantity}
                    onChange={(e) => setOutData({ ...outData, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات وسبب الصرف:</label>
                  <input
                    type="text"
                    value={outData.reason}
                    onChange={(e) => setOutData({ ...outData, reason: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockOutModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-danger">تأكيد الصرف من المخزن</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
