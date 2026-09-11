import React, { useState, useEffect } from 'react';
import { Settings, Save, Download, Upload, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView({ onSettingsUpdate }) {
  const [settings, setSettings] = useState({
    store_name: '',
    store_branch: '',
    store_phone: '',
    store_address: '',
    tax_number: '',
    commercial_register: '',
    tax_percentage: '0',
    currency: 'ج.م',
    receipt_header: '',
    receipt_footer: '',
    receipt_width: '80mm',
    auto_print: '1',
    invoice_prefix: 'INV-'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/settings', settings);
      alert('تم حفظ الإعدادات وتطبيقها بنجاح');
      if (onSettingsUpdate) onSettingsUpdate(settings);
    } catch (err) {
      alert(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await api.get('/settings/backup');
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zotech_market_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('تم تحميل النسخة الاحتياطية لقاعدة البيانات بنجاح');
    } catch (e) {
      alert(e.message || 'فشل تصدير النسخة الاحتياطية');
    }
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!window.confirm('تحذير: استعادة النسخة الاحتياطية ستستبدل البيانات الحالية بالبيانات المحفوظة. هل تريد المتابعة؟')) {
          return;
        }
        await api.post('/settings/restore', json);
        alert('تمت استعادة قاعدة البيانات بنجاح');
        window.location.reload();
      } catch (err) {
        alert('ملف النسخة الاحتياطية غير صالح أو تالف');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '10px' }}>
      <div
        className="pos-toolbar"
        style={{
          background: '#ffffff',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} style={{ color: '#234e70' }} />
          <h2 style={{ fontSize: '15px' }}>إعدادات النظام والمتجر والنسخ الاحتياطي</h2>
        </div>

        <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={14} />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Store Profile Section */}
        <div className="pos-panel">
          <div className="pos-panel-header">
            <span>بيانات وهوية المتجر (Store Profile)</span>
          </div>
          <div style={{ padding: '12px' }}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1.5 }}>
                <label>اسم السوبر ماركت / المنشأة:</label>
                <input
                  type="text"
                  value={settings.store_name}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  placeholder="سوبر ماركت..."
                />
              </div>
              <div className="form-group">
                <label>اسم الفرع:</label>
                <input
                  type="text"
                  value={settings.store_branch}
                  onChange={(e) => handleChange('store_branch', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>رقم هاتف المتجر:</label>
                <input
                  type="text"
                  value={settings.store_phone}
                  onChange={(e) => handleChange('store_phone', e.target.value)}
                  className="num-mono"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1.5 }}>
                <label>عنوان المتجر بالتفصيل:</label>
                <input
                  type="text"
                  value={settings.store_address}
                  onChange={(e) => handleChange('store_address', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>رقم التسجيل الضريبي:</label>
                <input
                  type="text"
                  value={settings.tax_number}
                  onChange={(e) => handleChange('tax_number', e.target.value)}
                  className="num-mono"
                />
              </div>
              <div className="form-group">
                <label>رقم السجل التجاري:</label>
                <input
                  type="text"
                  value={settings.commercial_register}
                  onChange={(e) => handleChange('commercial_register', e.target.value)}
                  className="num-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* POS & Receipt Settings Section */}
        <div className="pos-panel">
          <div className="pos-panel-header">
            <span>إعدادات نقطة البيع وطباعة الفواتير (POS & Printing)</span>
          </div>
          <div style={{ padding: '12px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>عرض الفاتورة الحرارية الافتراضي:</label>
                <select
                  value={settings.receipt_width}
                  onChange={(e) => handleChange('receipt_width', e.target.value)}
                >
                  <option value="80mm">طابعة حرارية 80mm (قياسي عريض)</option>
                  <option value="58mm">طابعة حرارية 58mm (صغيرة)</option>
                  <option value="a4">فواتير بحجم ورق A4</option>
                </select>
              </div>



              <div className="form-group">
                <label>العملة الرسمية:</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>بادئة رقم الفاتورة:</label>
                <input
                  type="text"
                  value={settings.invoice_prefix}
                  onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                  className="num-mono"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ترويسة الفاتورة (Header):</label>
                <input
                  type="text"
                  value={settings.receipt_header}
                  onChange={(e) => handleChange('receipt_header', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>رسالة تذييل الفاتورة (Footer):</label>
                <input
                  type="text"
                  value={settings.receipt_footer}
                  onChange={(e) => handleChange('receipt_footer', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database Backup & Restore Section */}
        <div className="pos-panel" style={{ borderTop: '3px solid #b45309' }}>
          <div className="pos-panel-header">
            <span>النسخ الاحتياطي واستعادة البيانات (Database Backup & Restore)</span>
          </div>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '13px', marginBottom: '4px' }}>تصدير نسخة احتياطية كاملة</h4>
              <p style={{ fontSize: '11.5px', color: '#64748b' }}>
                تنزيل ملف JSON يحتوي على كافة الجداول والمنتجات والمبيعات والحسابات للرجوع إليها في أي وقت.
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleDownloadBackup}>
              <Download size={14} />
              <span>تحميل نسخة احتياطية (JSON)</span>
            </button>
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '13px', marginBottom: '4px', color: '#b71c1c' }}>استعادة نسخة احتياطية سابقة</h4>
              <p style={{ fontSize: '11.5px', color: '#64748b' }}>
                اختر ملف النسخة الاحتياطية (JSON) لاسترجاع البيانات بالكامل.
              </p>
            </div>
            <label className="btn btn-danger" style={{ cursor: 'pointer' }}>
              <Upload size={14} />
              <span>استعادة نسخة احتياطية</span>
              <input type="file" accept=".json" onChange={handleRestoreBackup} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
