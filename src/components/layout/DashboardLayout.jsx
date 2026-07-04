import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Gavel } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Topbar from './Topbar';
import BuyerSidebar from './BuyerSidebar';
import SellerSidebar from './SellerSidebar';
import AdminSidebar from './AdminSidebar';

export const DashboardLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Select sidebar according to role
  const renderSidebar = () => {
    if (!user) return null;
    switch (user.role) {
      case 'Buyer':
        return <BuyerSidebar onClose={closeSidebar} />;
      case 'Seller':
        return <SellerSidebar onClose={closeSidebar} />;
      case 'Dealer':
        return <SellerSidebar onClose={closeSidebar} basePath="/dealer" />;
      case 'Admin':
        return <AdminSidebar onClose={closeSidebar} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Backdrop */}
      <div 
        className={`mobile-backdrop ${isSidebarOpen ? 'backdrop-open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Responsive Sidebar */}
      <aside className={`sidebar-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Gavel size={24} style={{ color: '#2563eb' }} />
          <span style={{ letterSpacing: '-0.03em' }}>DealsKB</span>
        </div>
        
        {/* Navigation items */}
        <div className="sidebar-nav-region">
          {renderSidebar()}
        </div>

        {/* Footer info in sidebar */}
        <div className="sidebar-footer">
          &copy; 2026 DealsKB Platform.
        </div>
      </aside>

      {/* Main Page Content Wrapper */}
      <div className="main-content-wrapper">
        <Topbar onToggleSidebar={toggleSidebar} />
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
