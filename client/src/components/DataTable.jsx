import React from 'react';

/**
 * Reusable Classic POS DataTable Component
 * Enforces 100% alignment between headers (TH) and body cells (TD)
 * Single source of truth for column definitions, widths, and alignments.
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'لا توجد بيانات مسجلة',
  loadingMessage = 'جاري التحميل...',
  rowKey = (item, idx) => item.id || idx,
  onRowClick = null,
  selectedId = null,
  className = '',
  containerStyle = {}
}) {
  return (
    <div className={`table-container ${className}`} style={{ flex: 1, ...containerStyle }}>
      <table className="dense-table">
        <thead>
          <tr>
            {columns.map((col, cIdx) => (
              <th
                key={col.key || cIdx}
                style={{
                  width: col.width,
                  minWidth: col.minWidth || col.width || '80px',
                  maxWidth: col.maxWidth,
                  textAlign: col.align || 'right'
                }}
                className={col.headerClassName || col.className || ''}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}
              >
                {loadingMessage}
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => {
              const key = typeof rowKey === 'function' ? rowKey(row, rIdx) : (row[rowKey] || rIdx);
              const isSelected = selectedId !== null && (row.id === selectedId || key === selectedId);

              return (
                <tr
                  key={key}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, cIdx) => {
                    let content = '-';
                    if (typeof col.render === 'function') {
                      content = col.render(row, rIdx);
                    } else if (col.key && row[col.key] !== undefined && row[col.key] !== null) {
                      content = row[col.key];
                    }

                    return (
                      <td
                        key={col.key || cIdx}
                        style={{
                          width: col.width,
                          minWidth: col.minWidth || col.width || '80px',
                          maxWidth: col.maxWidth,
                          textAlign: col.align || 'right',
                          ...(col.cellStyle ? col.cellStyle(row, rIdx) : {})
                        }}
                        className={col.className || ''}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
