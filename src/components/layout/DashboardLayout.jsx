import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Gavel } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import logoImg from '../../assets/logo.png';
import Topbar from './Topbar';
import BuyerSidebar from './BuyerSidebar';
import SellerSidebar from './SellerSidebar';
import AdminSidebar from './AdminSidebar';
import Footer from '../common/Footer';

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
    <div className="dashboard-layout">
      {/* Mobile Backdrop */}
      <div 
        className={`mobile-backdrop ${isSidebarOpen ? 'backdrop-open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Left Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logoImg} alt="DealsKB Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>DealsKB</span>
        </div>
        
        <nav className="sidebar-menu">
          {renderSidebar()}
        </nav>

        <div className="sidebar-footer">
          &copy; 2026 DealsKB Platform.
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="dashboard-right">
        <Topbar onToggleSidebar={toggleSidebar} />
        
        <main className="dashboard-main">
          <div className="dashboard-page-content">
            <Outlet />
          </div>
        </main>

        <footer>
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
