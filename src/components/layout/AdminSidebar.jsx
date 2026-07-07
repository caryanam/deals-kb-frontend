import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, BarChart3, ShieldAlert, Compass } from 'lucide-react';

export const AdminSidebar = ({ onClose }) => {
  const location = useLocation();
  const activePath = location.pathname;

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pending Listings', path: '/admin/listings/pending', icon: ClipboardList },
    { name: 'Community Demands', path: '/admin/community-requests', icon: Compass },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Abuse Reports', path: '/admin/reports', icon: ShieldAlert }
  ];

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = activePath === link.path || (link.path !== '/admin/dashboard' && activePath.startsWith(link.path));
        
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1.25rem',
              color: isActive ? '#ffffff' : '#8B8278',
              backgroundColor: isActive ? '#6B1B71' : 'transparent',
              borderRadius: '0.75rem',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              borderLeft: isActive ? '4px solid #10b981' : '4px solid transparent'
            }}
            className="sidebar-link"
          >
            <Icon size={20} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminSidebar;
