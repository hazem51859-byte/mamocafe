import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ReceiptModal from './components/ReceiptModal';
import NotificationsModal from './components/NotificationsModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import SwitchUserModal from './components/SwitchUserModal';
import OpenShiftModal from './components/OpenShiftModal';
import CloseShiftModal from './components/CloseShiftModal';

// Views
import ActivationView from './views/ActivationView';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import PosView from './views/PosView';
import ProductsView from './views/ProductsView';
import CategoriesView from './views/CategoriesView';
import InventoryView from './views/InventoryView';
import SalesView from './views/SalesView';
import ReturnsView from './views/ReturnsView';
import PurchasesView from './views/PurchasesView';
import SuppliersView from './views/SuppliersView';
import CustomersView from './views/CustomersView';
import ExpensesView from './views/ExpensesView';
import ShiftsView from './views/ShiftsView';
import ReportsView from './views/ReportsView';
import UsersView from './views/UsersView';
import SettingsView from './views/SettingsView';
import AdminMobileView from './views/AdminMobileView';

import { api, getStoredUser, setToken, setStoredUser } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isActivated, setIsActivated] = useState(true); // Checked on mount
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const user = getStoredUser();
      if (typeof window !== 'undefined' && window.innerWidth <= 768 && (user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager')) {
        return 'admin_mobile';
      }
    } catch (e) {}
    return 'pos';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Global Data with LocalStorage Persistence for instant GUI display
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('zotech_store_settings');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [activeShift, setActiveShift] = useState(null);

  // Global Overlays
  const [viewingReceiptSale, setViewingReceiptSale] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);

  // Check Activation Status on Mount
  useEffect(() => {
    api.get('/license/status')
      .then(res => {
        if (res && res.isActivated === false) {
          setIsActivated(false);
        } else {
          setIsActivated(true);
        }
      })
      .catch(() => {});
  }, []);

  // Update browser document title dynamically when store settings change
  useEffect(() => {
    if (storeSettings?.store_name) {
      document.title = `${storeSettings.store_name} ${storeSettings.store_branch ? `(${storeSettings.store_branch})` : ''} - ZoTech POS`;
    }
  }, [storeSettings]);

  // Restrict Cashier: can ONLY be on POS, Returns, or Products!
  useEffect(() => {
    if (currentUser?.role === 'cashier') {
      if (!['pos', 'returns', 'products'].includes(activeTab)) {
        setActiveTab('pos');
      }
    }
  }, [currentUser, activeTab]);

  // Load Settings & Active Shift on login
  useEffect(() => {
    if (!currentUser) return;

    async function loadAppMeta() {
      try {
        const [settingsRes, shiftRes] = await Promise.all([
          api.get('/settings'),
          api.get('/shifts/active')
        ]);
        if (settingsRes.settings) {
          setStoreSettings(settingsRes.settings);
          try {
            localStorage.setItem('zotech_store_settings', JSON.stringify(settingsRes.settings));
          } catch (e) {}
        }
        if (shiftRes.hasActiveShift) setActiveShift(shiftRes.metrics);
      } catch (e) {
        console.error('Failed to load initial app meta:', e);
      }
    }

    loadAppMeta();
  }, [currentUser]);

  // Handle settings update from SettingsView
  const handleSettingsUpdate = (newSettings) => {
    setStoreSettings(newSettings);
    try {
      localStorage.setItem('zotech_store_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setStoredUser(null);
    setCurrentUser(null);
  };

  // Switch user callback from SwitchUserModal (authenticated with password)
  const handleSwitchUserSuccess = async (newUser) => {
    setCurrentUser(newUser);
    if (newUser?.role === 'cashier' && !['pos', 'returns', 'products'].includes(activeTab)) {
      setActiveTab('pos');
    }
    // Refresh active shift
    try {
      const shiftRes = await api.get('/shifts/active');
      setActiveShift(shiftRes.hasActiveShift ? shiftRes.metrics : null);
    } catch (e) {}
  };

  // If system is not activated, render Hardware Activation Screen
  if (!isActivated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <ActivationView onActivationSuccess={() => setIsActivated(true)} />
        </div>
        <Footer />
      </div>
    );
  }

  // If not logged in, render Login View
  if (!currentUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <LoginView onLoginSuccess={(u) => setCurrentUser(u)} storeSettings={storeSettings} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeShift={activeShift}
        onLogout={handleLogout}
        onOpenSwitchUser={() => setShowSwitchUserModal(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenNotifications={() => setShowNotifications(true)}
        storeSettings={storeSettings}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        onOpenShift={() => setShowOpenShiftModal(true)}
        onCloseShift={() => setShowCloseShiftModal(true)}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Main Workspace (Sidebar + Screen Content) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          userPermissions={currentUser.permissions}
          currentUser={currentUser}
          onOpenChangePassword={() => setShowChangePasswordModal(true)}
        />

        {/* View Container */}
        <main style={{ flex: 1, overflow: 'hidden', background: '#eef2f6', position: 'relative' }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenInvoice={async (id) => {
                const sale = await api.get(`/sales/${id}`);
                setViewingReceiptSale(sale);
              }}
            />
          )}

          {activeTab === 'pos' && (
            <PosView
              currentUser={currentUser}
              activeShift={activeShift}
              soundEnabled={soundEnabled}
              storeSettings={storeSettings}
              onOpenReceipt={(sale) => setViewingReceiptSale(sale)}
              onOpenReturns={() => setActiveTab('returns')}
              onOpenShift={() => setShowOpenShiftModal(true)}
              onCloseShift={() => setShowCloseShiftModal(true)}
            />
          )}

          {activeTab === 'products' && <ProductsView currentUser={currentUser} />}

          {activeTab === 'categories' && <CategoriesView />}

          {activeTab === 'inventory' && <InventoryView />}

          {activeTab === 'sales' && (
            <SalesView onOpenReceipt={(sale) => setViewingReceiptSale(sale)} />
          )}

          {activeTab === 'returns' && <ReturnsView />}

          {activeTab === 'purchases' && <PurchasesView />}

          {activeTab === 'suppliers' && <SuppliersView />}

          {activeTab === 'customers' && <CustomersView />}

          {activeTab === 'expenses' && <ExpensesView />}

          {activeTab === 'shifts' && (
            <ShiftsView
              onShiftChange={(s) => setActiveShift(s)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'users' && <UsersView />}

          {activeTab === 'settings' && (
            <SettingsView onSettingsUpdate={handleSettingsUpdate} />
          )}

          {activeTab === 'admin_mobile' && (
            <AdminMobileView
              currentUser={currentUser}
              storeSettings={storeSettings}
            />
          )}
        </main>
      </div>

      {/* ZoTech Footer - Present on EVERY page */}
      <Footer />

      {/* Global Receipt Print Preview Modal */}
      {viewingReceiptSale && (
        <ReceiptModal
          sale={viewingReceiptSale}
          storeSettings={storeSettings}
          onClose={() => setViewingReceiptSale(null)}
        />
      )}

      {/* Global Notifications Modal */}
      {showNotifications && (
        <NotificationsModal
          onClose={() => setShowNotifications(false)}
          onNavigate={(tab) => {
            setShowNotifications(false);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Global Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          currentUser={currentUser}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      {/* Global Switch User Modal (Password Protected) */}
      {showSwitchUserModal && (
        <SwitchUserModal
          currentUser={currentUser}
          onSwitchSuccess={handleSwitchUserSuccess}
          onClose={() => setShowSwitchUserModal(false)}
        />
      )}

      {/* Global Open Shift Modal */}
      {showOpenShiftModal && (
        <OpenShiftModal
          currentUser={currentUser}
          onShiftOpened={(metrics) => setActiveShift(metrics)}
          onClose={() => setShowOpenShiftModal(false)}
        />
      )}

      {/* Global Close Shift Modal */}
      {showCloseShiftModal && (
        <CloseShiftModal
          activeShift={activeShift}
          onShiftClosed={() => setActiveShift(null)}
          onClose={() => setShowCloseShiftModal(false)}
        />
      )}
    </div>
  );
}
