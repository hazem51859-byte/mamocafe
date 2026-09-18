import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sliders,
  AlertTriangle,
  RefreshCw,
  X,
  Check,
  Filter,
  Coins,
  ShoppingCart,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';

export default function ProductsView({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('تسوية جردية');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    barcode: '',
    sku: '',
    name: '',
    categoryId: '',
    brandId: '',
    unit: 'قطعة',
    purchasePrice: '',
    sellingPrice: '',
    wholesalePrice: '',
    minPrice: '',
    taxPercent: '0',
    stockQuantity: '',
    minStockAlert: '5',
    expiryDate: '',
    supplierId: '',
    isWeight: false,
    notes: '',
    units: []
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products', {
        search,
        categoryId: selectedCategory,
        limit: 100
      });
      setProducts(res.products || []);
      setTotal(res.total || 0);

      if (res.inventoryStats) {
        setInventoryStats(res.inventoryStats);
      } else {
        const prods = res.products || [];
        const costVal = prods.reduce((acc, p) => acc + (p.stock_quantity > 0 ? Number(p.stock_quantity) * Number(p.purchase_price) : 0), 0);
        const sellVal = prods.reduce((acc, p) => acc + (p.stock_quantity > 0 ? Number(p.stock_quantity) * Number(p.selling_price) : 0), 0);
        const profit = sellVal - costVal;
        const margin = sellVal > 0 ? (profit / sellVal) * 100 : 0;
        setInventoryStats({
          totalProducts: res.total || prods.length,
          totalStockQty: prods.reduce((acc, p) => acc + Number(p.stock_quantity || 0), 0),
          totalCostValue: costVal,
          totalSellingValue: sellVal,
          expectedProfit: profit,
          profitMargin: margin,
          isFiltered: Boolean(search || selectedCategory)
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, supRes] = await Promise.all([
          api.get('/categories'),
          api.get('/suppliers')
        ]);
        setCategories(catRes || []);
        setSuppliers(supRes || []);
      } catch (e) {}
    }
    loadMeta();
  }, []);

  useEffect(() => {
    const delay = setTimeout(loadProducts, 250);
    return () => clearTimeout(delay);
  }, [search, selectedCategory]);

  const handleOpenAdd = () => {
    setEditProduct(null);
    setFormData({
      barcode: `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`,
      sku: '',
      name: '',
      categoryId: categories[0]?.id || '',
      brandId: '',
      unit: 'قطعة',
      purchasePrice: '',
      sellingPrice: '',
      wholesalePrice: '',
      minPrice: '',
      taxPercent: '0',
      stockQuantity: '10',
      minStockAlert: '5',
      expiryDate: '',
      supplierId: suppliers[0]?.id || '',
      isWeight: false,
      notes: '',
      units: []
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setFormData({
      barcode: p.barcode,
      sku: p.sku || '',
      name: p.name,
      categoryId: p.category_id || '',
      brandId: p.brand_id || '',
      unit: p.unit || 'قطعة',
      purchasePrice: p.purchase_price,
      sellingPrice: p.selling_price,
      wholesalePrice: p.wholesale_price || '',
      minPrice: p.min_price || '',
      taxPercent: '0',
      stockQuantity: p.stock_quantity,
      minStockAlert: p.min_stock_alert || '5',
      expiryDate: p.expiry_date || '',
      supplierId: p.supplier_id || '',
      isWeight: !!p.is_weight,
      notes: p.notes || '',
      units: p.units || []
    });
    setShowAddEditModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, formData);
        alert('تم تحديث بيانات المنتج بنجاح');
      } else {
        await api.post('/products', formData);
        alert('تمت إضافة المنتج بنجاح');
      }
      setShowAddEditModal(false);
      loadProducts();
    } catch (err) {
      alert(err.message || 'فشل حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج "${p.name}"؟`)) return;
    try {
      const res = await api.delete(`/products/${p.id}`);
      alert(res.message || 'تم حذف المنتج');
      loadProducts();
    } catch (err) {
      alert(err.message || 'فشل حذف المنتج');
    }
  };

  const handleOpenAdjust = (p) => {
    setAdjustItem(p);
    setAdjustQty(p.stock_quantity.toString());
    setAdjustReason('تسوية جرد دوري');
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = async () => {
    try {
      await api.post(`/products/${adjustItem.id}/adjust-stock`, {
        newQuantity: adjustQty,
        reason: adjustReason
      });
      alert('تم تعديل رصيد المخزون وتسجيل حركة التسوية بنجاح');
      setShowAdjustModal(false);
      loadProducts();
    } catch (err) {
      alert(err.message || 'فشل تعديل الرصيد');
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
      key: 'barcode',
      label: 'الباركود',
      minWidth: '130px',
      className: 'num-mono',
      render: p => <span style={{ fontWeight: 600 }}>{p.barcode}</span>
    },
    {
      key: 'name',
      label: 'اسم الصنف',
      minWidth: '220px',
      render: p => (
        <span style={{ fontWeight: 700 }}>
          {p.name}
          {p.is_weight === 1 && (
            <span className="badge badge-warning" style={{ marginRight: '4px', fontSize: '10px' }}>
              ميزان
            </span>
          )}
        </span>
      )
    },
    {
      key: 'category_name',
      label: 'التصنيف',
      minWidth: '120px',
      render: p => p.category_name || '-'
    },
    {
      key: 'unit',
      label: 'الوحدة',
      minWidth: '75px',
      align: 'center',
      render: p => p.unit
    },
    {
      key: 'purchase_price',
      label: 'سعر الشراء',
      minWidth: '100px',
      className: 'num-mono',
      render: p => `${parseFloat(p.purchase_price).toFixed(2)} ج.م`
    },
    {
      key: 'selling_price',
      label: 'سعر البيع',
      minWidth: '100px',
      className: 'num-mono',
      render: p => (
        <span style={{ fontWeight: 700, color: '#15803d' }}>
          {parseFloat(p.selling_price).toFixed(2)} ج.م
        </span>
      )
    },
    {
      key: 'wholesale_price',
      label: 'سعر الجملة',
      minWidth: '100px',
      className: 'num-mono',
      render: p => (p.wholesale_price ? `${parseFloat(p.wholesale_price).toFixed(2)} ج.م` : '-')
    },
    {
      key: 'stock_quantity',
      label: 'المخزون الحالي',
      minWidth: '110px',
      align: 'center',
      className: 'num-mono',
      render: p => (
        <span
          className={`badge ${
            p.stock_quantity <= 0
              ? 'badge-danger'
              : p.stock_quantity <= p.min_stock_alert
              ? 'badge-warning'
              : 'badge-navy'
          }`}
        >
          {p.stock_quantity} {p.unit}
        </span>
      )
    },
    {
      key: 'min_stock_alert',
      label: 'حد الأمان',
      minWidth: '85px',
      align: 'center',
      className: 'num-mono',
      render: p => `${p.min_stock_alert} ${p.unit}`
    },
    {
      key: 'expiry_date',
      label: 'تاريخ الصلاحية',
      minWidth: '110px',
      className: 'num-mono',
      render: p => <span style={{ fontSize: '11px' }}>{p.expiry_date || '-'}</span>
    },
    {
      key: 'is_active',
      label: 'الحالة',
      minWidth: '85px',
      align: 'center',
      render: p => (
        p.is_active ? (
          <span className="badge badge-success">نشط</span>
        ) : (
          <span className="badge badge-danger">معطل</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'إجراءات',
      minWidth: '130px',
      align: 'center',
      render: p => (
        <div style={{ display: 'inline-flex', gap: '3px' }}>
          <button
            className="btn btn-sm"
            style={{ padding: '2px 5px' }}
            title="تسوية الرصيد"
            onClick={(e) => { e.stopPropagation(); handleOpenAdjust(p); }}
          >
            <Sliders size={12} />
          </button>
          <button
            className="btn btn-sm"
            style={{ padding: '2px 5px' }}
            title="تعديل"
            onClick={(e) => { e.stopPropagation(); handleOpenEdit(p); }}
          >
            <Edit2 size={12} />
          </button>
          <button
            className="btn btn-sm btn-danger"
            style={{ padding: '2px 5px' }}
            title="حذف"
            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p); }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )
    }
  ];

  const visibleColumns = currentUser?.role === 'cashier'
    ? columns.filter(c => c.key !== 'actions')
    : columns;

  const isCashier = currentUser?.role === 'cashier';

  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px' }}>
      {/* =========================================================================
          Top Inventory Financial Summary Cards
         ========================================================================= */}
      {inventoryStats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Header indicator when filtering */}
          {inventoryStats.isFiltered && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '4px 10px',
                borderRadius: '5px',
                fontSize: '11px',
                color: '#92400e'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={13} />
                <span>
                  <strong>تنبيه:</strong> الأرقام التالية محسوبة فقط للأصناف المطابقة للتصفية الحالية
                  {selectedCategory ? ` (${categories.find(c => String(c.id) === String(selectedCategory))?.name || 'تصنيف محدد'})` : ''}
                  {search ? ` (بحث: "${search}")` : ''}
                </span>
              </div>
              <button
                className="btn btn-sm"
                style={{ padding: '1px 8px', fontSize: '10px', background: '#ffffff', borderColor: '#d97706', color: '#92400e' }}
                onClick={() => { setSearch(''); setSelectedCategory(''); }}
              >
                إلغاء التصفية وعرض إجمالي المخزن بالكامل
              </button>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isCashier ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '8px'
            }}
          >
            {/* 1. Total Cost Value (Purchase Price) */}
            {!isCashier && (
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
                    إجمالي سعر الشراء (التكلفة)
                  </div>
                  <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#1e40af', letterSpacing: '-0.3px' }}>
                    {formatMoney(inventoryStats.totalCostValue)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    تكلفة شراء البضاعة الحالية بالجملة
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
                  <Coins size={19} />
                </div>
              </div>
            )}

            {/* 2. Total Selling Value (Retail Price) */}
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
                  إجمالي سعر البيع (القيمة السوقية)
                </div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#065f46', letterSpacing: '-0.3px' }}>
                  {formatMoney(inventoryStats.totalSellingValue)}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  إجمالي القيمة بسعر بيع الرف للمستهلك
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
                <ShoppingCart size={19} />
              </div>
            </div>

            {/* 3. Expected Profit & Margin */}
            {!isCashier && (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                      صافي الأرباح المتوقعة
                    </span>
                    <span
                      className="num-mono"
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        background: '#f5f3ff',
                        color: '#7c3aed',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd6fe'
                      }}
                    >
                      %{inventoryStats.profitMargin?.toFixed(1) || 0} هامش
                    </span>
                  </div>
                  <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#5b21b6', letterSpacing: '-0.3px' }}>
                    {formatMoney(inventoryStats.expectedProfit)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    الربح المقدر عند بيع كل الكميات المتوفرة
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
                  <TrendingUp size={19} />
                </div>
              </div>
            )}

            {/* 4. Total Stock Volume & Count */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderTop: '3px solid #d97706',
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
                  حجم المخزون المتوفر
                </div>
                <div className="num-mono" style={{ fontSize: '17px', fontWeight: 800, color: '#92400e', letterSpacing: '-0.3px' }}>
                  {Number(inventoryStats.totalStockQty || 0).toLocaleString('en-US')} <span style={{ fontSize: '11px', fontWeight: 600 }}>وحدة</span>
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  موزعة على {inventoryStats.totalProducts || 0} صنف مسجل
                </div>
              </div>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#fffbeb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706'
                }}
              >
                <Boxes size={19} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div
        className="pos-toolbar"
        style={{
          background: '#ffffff',
          marginBottom: '0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', right: '8px', color: '#64748b' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الباركود..."
              style={{ paddingRight: '28px', width: '220px' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">جميع التصنيفات</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <span className="badge badge-navy">إجمالي المنتجات: {total}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-sm" onClick={loadProducts}>
            <RefreshCw size={13} />
            <span>تحديث</span>
          </button>
          {currentUser?.role !== 'cashier' && (
            <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
              <Plus size={14} />
              <span>إضافة منتج جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={visibleColumns}
        data={products}
        loading={loading}
        emptyMessage="لا توجد منتجات مطابقة"
        rowKey={p => p.id}
      />

      {/* =========================================================================
          Add / Edit Product Modal
         ========================================================================= */}
      {showAddEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '750px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} />
                <span>{editProduct ? `تعديل المنتج: ${editProduct.name}` : 'إضافة منتج جديد للسوبر ماركت'}</span>
              </div>
              <button className="close-btn" onClick={() => setShowAddEditModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label>اسم المنتج (*):</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: حليب جهينة 1 لتر"
                    />
                  </div>
                  <div className="form-group">
                    <label>الباركود الدولي (*):</label>
                    <input
                      type="text"
                      required
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="num-mono"
                      placeholder="6221000..."
                    />
                  </div>
                  <div className="form-group">
                    <label>كود الصنف / SKU:</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="num-mono"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>القسم / التصنيف:</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">بدون تصنيف</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>وحدة البيع:</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option value="قطعة">قطعة</option>
                      <option value="علبة">علبة</option>
                      <option value="كيس">كيس</option>
                      <option value="زجاجة">زجاجة</option>
                      <option value="برطمان">برطمان</option>
                      <option value="كرتونة">كرتونة</option>
                      <option value="كيلوجرام">كيلوجرام (ميزان)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>المورد المعتمد:</label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    >
                      <option value="">بدون مورد محدد</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>سعر الشراء / التكلفة (ج.م) (*):</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>سعر البيع قطاعي (ج.م) (*):</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      placeholder="0.00"
                      style={{ fontWeight: 800, color: '#15803d' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>سعر الجملة (ج.م):</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>أقل سعر بيع مسموح:</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.minPrice}
                      onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-row">
                  {!editProduct && (
                    <div className="form-group">
                      <label>الرصيد الافتتاحي:</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>حد تنبيه النواقص (الأمان):</label>
                    <input
                      type="number"
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                      placeholder="5"
                    />
                  </div>

                  <div className="form-group">
                    <label>تاريخ الصلاحية:</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', paddingTop: '22px' }}>
                    <input
                      type="checkbox"
                      id="isWeightCheck"
                      checked={formData.isWeight}
                      onChange={(e) => setFormData({ ...formData, isWeight: e.target.checked })}
                    />
                    <label htmlFor="isWeightCheck" style={{ cursor: 'pointer', fontWeight: 700 }}>
                      يباع بالوزن (ميزان إلكتروني)
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>ملاحظات إضافية:</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات حول المنتج أو موقع الرف..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddEditModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={14} />
                  <span>{editProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          Stock Adjustment Modal
         ========================================================================= */}
      {showAdjustModal && adjustItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '420px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} />
                <span>تسوية رصيد: {adjustItem.name}</span>
              </div>
              <button className="close-btn" onClick={() => setShowAdjustModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: '12px', marginBottom: '8px', color: '#475569' }}>
                الرصيد الدفتري الحالي: <strong className="num-mono">{adjustItem.stock_quantity} {adjustItem.unit}</strong>
              </div>

              <div className="form-group">
                <label>الرصيد الفعلي بعد الجرد والتسوية:</label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  style={{ fontSize: '18px', fontWeight: 800, textAlign: 'center', padding: '6px' }}
                />
              </div>

              <div className="form-group">
                <label>سبب التسوية الجردية:</label>
                <select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}>
                  <option value="تسوية جرد دوري">تسوية جرد دوري</option>
                  <option value="عجز جردي في الصالة">عجز جردي في الصالة</option>
                  <option value="فائض جردي غير مسجل">فائض جردي غير مسجل</option>
                  <option value="توالف وتكسير بضاعة">توالف وتكسير بضاعة</option>
                  <option value="خطأ إدخال سابق">خطأ إدخال سابق</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdjustModal(false)}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleSaveAdjust}>تأكيد التسوية وحفظ الحركة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
