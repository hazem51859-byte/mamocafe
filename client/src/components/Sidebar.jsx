import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Archive,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Truck,
  Users,
  Wallet,
  Coins,
  BarChart3,
  UserCog,
  Settings,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  Smartphone
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  userPermissions = [],
  currentUser,
  onOpenChangePassword
}) {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, perm: 'view_dashboard' },
    { id: 'pos', label: 'نقطة البيع (POS)', icon: ShoppingCart, perm: 'pos_checkout', highlight: true },
    { id: 'products', label: 'المنتجات', icon: Package, perm: 'view_products' },
    { id: 'categories', label: 'التصنيفات', icon: Boxes, perm: 'view_products' },
    { id: 'inventory', label: 'المخزون والجرد', icon: Archive, perm: 'view_inventory' },
    { id: 'sales', label: 'المبيعات والفواتير', icon: Receipt, perm: 'view_sales' },
    { id: 'returns', label: 'مرتجعات المبيعات', icon: RotateCcw, perm: 'sales_returns' },
    { id: 'purchases', label: 'المشتريات', icon: ShoppingBag, perm: 'view_purchases' },
    { id: 'suppliers', label: 'الموردين', icon: Truck, perm: 'view_suppliers' },
    { id: 'customers', label: 'العملاء والديون', icon: Users, perm: 'view_customers' },
    { id: 'expenses', label: 'المصروفات', icon: Wallet, perm: 'view_expenses' },
    { id: 'shifts', label: 'الخزينة والشيفتات', icon: Coins, perm: 'shifts_manage' },
    { id: 'reports', label: 'التقارير والأرباح', icon: BarChart3, perm: 'view_reports' },
    { id: 'admin_mobile', label: 'بوابة الموبايل (للإدارة)', icon: Smartphone, perm: 'view_reports', adminOnly: true },
    { id: 'users', label: 'المستخدمين', icon: UserCog, perm: 'manage_users' },
    { id: 'settings', label: 'الإعدادات والنسخ', icon: Settings, perm: 'manage_settings' }
  ];

  // Cashier restriction: ONLY sees POS, Returns, and Products!
  const isCashier = currentUser?.role === 'cashier';
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const visibleMenuItems = menuItems.filter(item => {
    if (isCashier) {
      return ['pos', 'returns', 'products'].includes(item.id);
    }
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    if (isAdmin) {
      return true;
    }
    return !item.perm || userPermissions.includes(item.perm);
  });

  return (
    <aside
      className="app-sidebar no-print"
      style={{
        width: isCollapsed ? '52px' : '190px',
        backgroundColor: '#1b2838',
        color: '#e2e8f0',
        borderLeft: '1px solid #0f172a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.15s ease',
        flexShrink: 0,
        userSelect: 'none',
        height: '100%'
      }}
    >
      {/* Collapse Toggle Button */}
      <div
        style={{
          padding: '6px 8px',
          borderBottom: '1px solid #243547',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          background: '#152130'
        }}
      >
        {!isCollapsed && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
            قائمة النظام
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            padding: '3px',
            cursor: 'pointer',
            boxShadow: 'none',
            flexShrink: 0
          }}
          title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {visibleMenuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isCollapsed ? '0' : '9px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '8px 0' : '6px 12px',
                fontSize: '12.5px',
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? '#ffffff'
                  : item.highlight
                  ? '#38bdf8'
                  : '#cbd5e1',
                backgroundColor: isActive
                  ? '#243b55'
                  : item.highlight
                  ? '#13283f'
                  : 'transparent',
                borderRight: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'background-color 0.1s',
                marginBottom: '1px'
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={16} style={{ flexShrink: 0, color: isActive ? '#38bdf8' : 'inherit' }} />
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile / Change Password Action */}
      <div
        style={{
          padding: '6px 8px',
          borderTop: '1px solid #243547',
          background: '#152130'
        }}
      >
        <button
          onClick={onOpenChangePassword}
          className="btn btn-sm"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '8px',
            background: '#1e293b',
            color: '#38bdf8',
            borderColor: '#334155',
            fontSize: '11px',
            padding: '5px 8px'
          }}
          title="تغيير كلمة المرور"
        >
          <KeyRound size={14} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>تغيير كلمة المرور</span>}
        </button>
      </div>
    </aside>
  );
}
