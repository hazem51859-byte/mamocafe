import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * ProductSearchSelect — searchable product picker.
 *
 * Props:
 *   products     – array of product objects (must have .id, .name, .barcode)
 *   value        – currently selected product id (string|number)
 *   onChange     – callback(productId)
 *   placeholder  – input placeholder text
 *   renderLabel  – optional (product) => string, custom label per option
 *   required     – bool
 *   style        – extra wrapper style
 */
export default function ProductSearchSelect({
  products = [],
  value,
  onChange,
  placeholder = 'ابحث بالاسم أو الباركود...',
  renderLabel,
  required = false,
  style = {}
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Default label renderer
  const getLabel = (p) => {
    if (renderLabel) return renderLabel(p);
    return `${p.name} (${p.barcode || '---'})`;
  };

  // Find selected product for display
  const selectedProduct = products.find(p => String(p.id) === String(value));

  // Filter products based on query
  const filtered = query.trim()
    ? products.filter(p => {
        const q = query.trim().toLowerCase();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
        );
      })
    : products;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.pss-item');
      if (items[highlightIdx]) {
        items[highlightIdx].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIdx]);

  const handleSelect = (product) => {
    onChange(String(product.id));
    setQuery('');
    setIsOpen(false);
    setHighlightIdx(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx(prev => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          handleSelect(filtered[highlightIdx]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightIdx(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', ...style }}>
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={value || ''}
          onChange={() => {}}
          tabIndex={-1}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Main input area */}
      <div
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #cbd5e1',
          borderRadius: '3px',
          background: '#fff',
          padding: '0',
          cursor: 'text',
          minHeight: '30px',
          fontSize: '12px'
        }}
      >
        <Search size={13} style={{ margin: '0 5px', color: '#94a3b8', flexShrink: 0 }} />

        {selectedProduct && !isOpen ? (
          <div style={{
            flex: 1,
            padding: '4px 6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px'
          }}>
            <span style={{ fontWeight: 600 }}>{getLabel(selectedProduct)}</span>
            <X
              size={13}
              style={{ cursor: 'pointer', color: '#94a3b8', flexShrink: 0 }}
              onClick={handleClear}
            />
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightIdx(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedProduct ? getLabel(selectedProduct) : placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '4px 6px',
              fontSize: '12px',
              background: 'transparent',
              minWidth: 0
            }}
          />
        )}
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            left: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #cbd5e1',
            borderTop: 'none',
            borderRadius: '0 0 3px 3px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{
              padding: '10px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '12px'
            }}>
              لا توجد نتائج مطابقة
            </div>
          ) : (
            filtered.map((p, idx) => (
              <div
                key={p.id}
                className="pss-item"
                onClick={() => handleSelect(p)}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: String(p.id) === String(value)
                    ? '#e0f2fe'
                    : idx === highlightIdx
                    ? '#f1f5f9'
                    : '#fff',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
                onMouseEnter={() => setHighlightIdx(idx)}
              >
                <span style={{ fontWeight: String(p.id) === String(value) ? 700 : 400 }}>
                  {getLabel(p)}
                </span>
                {p.stock_quantity !== undefined && (
                  <span style={{
                    fontSize: '10px',
                    color: p.stock_quantity <= 0 ? '#ef4444' : '#64748b',
                    whiteSpace: 'nowrap'
                  }}>
                    رصيد: {p.stock_quantity}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
