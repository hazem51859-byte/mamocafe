import React, { useState } from 'react';
import { Printer, X, FileText, Check } from 'lucide-react';

export default function ReceiptModal({ sale, storeSettings, onClose }) {
  const [format, setFormat] = useState('80mm'); // '80mm', '58mm', 'a4'

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const storeName = storeSettings?.store_name || 'سوبر ماركت التوحيد والسلام';
  const branch = storeSettings?.store_branch || 'الفرع الرئيسي - المعادي';
  const phone = storeSettings?.store_phone || '01275984405';
  const address = storeSettings?.store_address || 'شارع النصر، ميدان الجزائر، المعادي، القاهرة';
  const taxNumber = storeSettings?.tax_number || 'EG-493-820-117';
  const footerText = storeSettings?.receipt_footer || 'شكراً لزيارتكم - البضاعة المباعة ترد وتستبدل خلال 14 يوماً';

  const items = sale.items || [];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '560px', maxHeight: '95vh' }}>
        {/* Modal Header */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} />
            <span>معاينة وطباعة الفاتورة - {sale.invoice_number}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Format Picker */}
            <div style={{ display: 'flex', background: '#0f172a', padding: '2px', borderRadius: '2px' }}>
              <button
                className={`btn btn-sm ${format === '80mm' ? 'btn-primary' : ''}`}
                style={{ padding: '2px 6px', fontSize: '11px', border: 'none' }}
                onClick={() => setFormat('80mm')}
              >
                حراري 80mm
              </button>
              <button
                className={`btn btn-sm ${format === '58mm' ? 'btn-primary' : ''}`}
                style={{ padding: '2px 6px', fontSize: '11px', border: 'none' }}
                onClick={() => setFormat('58mm')}
              >
                حراري 58mm
              </button>
              <button
                className={`btn btn-sm ${format === 'a4' ? 'btn-primary' : ''}`}
                style={{ padding: '2px 6px', fontSize: '11px', border: 'none' }}
                onClick={() => setFormat('a4')}
              >
                تقرير A4
              </button>
            </div>

            <button className="close-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Modal Body / Printable Area */}
        <div className="modal-body" style={{ background: '#f1f5f9', padding: '16px', overflowY: 'auto' }}>
          <div className={`receipt-wrapper receipt-${format} printable-area`}>
            {/* Header */}
            <div className="receipt-header">
              <h2>{storeName}</h2>
              <div>{branch}</div>
              <div>{address}</div>
              <div>هاتف: <span className="num-mono">{phone}</span></div>
              <div>الرقم الضريبي: <span className="num-mono">{taxNumber}</span></div>
            </div>

            {/* Meta */}
            <div style={{ fontSize: '11.5px', marginBottom: '6px' }}>
              <div className="receipt-row">
                <span>رقم الفاتورة:</span>
                <strong className="num-mono">{sale.invoice_number}</strong>
              </div>
              <div className="receipt-row">
                <span>الكاشير:</span>
                <span>{sale.cashier_name || 'كاشير'}</span>
              </div>
              {sale.customer_name && (
                <div className="receipt-row">
                  <span>العميل:</span>
                  <span>{sale.customer_name}</span>
                </div>
              )}
              <div className="receipt-row">
                <span>التاريخ والوقت:</span>
                <span className="num-mono">
                  {new Date(sale.created_at || Date.now()).toLocaleString('ar-EG')}
                </span>
              </div>
            </div>

            <div className="receipt-divider" />

            {/* Items Table */}
            <table className="receipt-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>الصنف</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>الكمية</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>السعر</th>
                  <th style={{ width: '20%', textAlign: 'left' }}>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                      {item.barcode && <div style={{ fontSize: '9.5px', color: '#555' }} className="num-mono">{item.barcode}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }} className="num-mono">
                      {item.quantity} {item.unit || ''}
                    </td>
                    <td style={{ textAlign: 'center' }} className="num-mono">
                      {parseFloat(item.unit_price).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'left', fontWeight: 700 }} className="num-mono">
                      {parseFloat(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-divider" />

            {/* Totals */}
            <div style={{ fontSize: '12px' }}>
              <div className="receipt-row">
                <span>المجموع الفرعي:</span>
                <span className="num-mono">{parseFloat(sale.subtotal).toFixed(2)} ج.م</span>
              </div>

              {parseFloat(sale.discount_amount) > 0 && (
                <div className="receipt-row" style={{ color: '#b71c1c' }}>
                  <span>الخصم:</span>
                  <span className="num-mono">- {parseFloat(sale.discount_amount).toFixed(2)} ج.م</span>
                </div>
              )}



              <div className="receipt-divider" />

              <div className="receipt-row" style={{ fontSize: '15px', fontWeight: 800 }}>
                <span>الإجمالي النهائي:</span>
                <span className="num-mono">{parseFloat(sale.grand_total).toFixed(2)} ج.م</span>
              </div>

              <div className="receipt-row">
                <span>طريقة الدفع:</span>
                <strong>
                  {sale.payment_method === 'cash' && 'نقدي (Cash)'}
                  {sale.payment_method === 'visa' && 'فيزا (Visa)'}
                  {sale.payment_method === 'mastercard' && 'ماستركارد (Mastercard)'}
                  {sale.payment_method === 'wallet' && 'محفظة إلكترونية (Wallet)'}
                  {sale.payment_method === 'instapay' && 'إنستاباي (Instapay)'}
                  {sale.payment_method === 'credit' && 'آجل (على الحساب)'}
                  {sale.payment_method === 'mixed' && 'دفع مركب (مجزأ)'}
                </strong>
              </div>

              <div className="receipt-row">
                <span>المدفوع:</span>
                <span className="num-mono">{parseFloat(sale.paid_amount || sale.grand_total).toFixed(2)} ج.م</span>
              </div>

              {parseFloat(sale.change_amount) > 0 && (
                <div className="receipt-row">
                  <span>الباقي للعميل:</span>
                  <span className="num-mono" style={{ fontWeight: 700 }}>
                    {parseFloat(sale.change_amount).toFixed(2)} ج.م
                  </span>
                </div>
              )}

              {parseFloat(sale.remaining_amount) > 0 && (
                <div className="receipt-row" style={{ color: '#b71c1c' }}>
                  <span>المتبقي (دين على العميل):</span>
                  <span className="num-mono" style={{ fontWeight: 700 }}>
                    {parseFloat(sale.remaining_amount).toFixed(2)} ج.م
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="receipt-footer">
              <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '3px' }}>
                {footerText}
              </div>
              <div style={{ fontSize: '10px', color: '#444' }}>
                نظام كاشير متطور بواسطة ZoTech | واتساب: 01275984405
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Print Button */}
        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            إغلاق
          </button>
          <button className="btn btn-primary btn-lg" onClick={handlePrint}>
            <Printer size={16} />
            <span>طباعة الفاتورة الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
}
