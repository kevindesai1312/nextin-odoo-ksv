import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  CheckCircle,
  ShoppingCart,
  Receipt,
  BarChart3,
  Activity,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Manager'] },
  { label: 'Users', icon: UserCircle, path: '/users', roles: ['Admin'] },
  { label: 'Vendors', icon: Users, path: '/vendors', roles: ['Admin'] },
  { label: "RFQ's", icon: FileText, path: '/rfqs', roles: ['Officer', 'Vendor'] },
  { label: 'Quotations', icon: ClipboardList, path: '/quotations', roles: ['Vendor'] },
  { label: 'Compare Quotes', icon: ClipboardList, path: '/comparison', roles: ['Officer'] },
  { label: 'Approvals', icon: CheckCircle, path: '/approvals', roles: ['Manager'] },
  { label: 'Purchase Orders', icon: ShoppingCart, path: '/purchase-orders', roles: ['Officer', 'Vendor'] },
  { label: 'Invoices', icon: Receipt, path: '/invoices', roles: ['Officer'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['Admin', 'Manager'] },
  { label: 'Monitor Workflows', icon: Activity, path: '/activity', roles: ['Admin', 'Manager'] },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: '200px',
        minWidth: '200px',
        background: '#E8F5F0',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #B8D4C8',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #B8D4C8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#0D9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 17h8M4 17l4-10 4 10M12 7h8M12 17h8" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            color: '#0F172A',
          }}
        >
          VendorBridge
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {navItems
          .filter((item) => item.roles.includes(user?.role || 'Admin'))
          .map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              style={{
                width: '100%',
                marginBottom: '4px',
                border: 'none',
                background: isActive ? '#D4EDE4' : 'transparent',
                color: isActive ? '#0F172A' : '#334155',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
              }}
            >
              <Icon size={18} strokeWidth={2} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Avatar */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #B8D4C8',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <UserCircle size={32} color="#64748B" />
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                border: '2px solid #E8F5F0',
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#1E293B',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'User'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#64748B',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {user?.role || 'User'}
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: '#DC2626',
            textAlign: 'left',
            marginTop: '4px',
          }}
        >
          <LogOut size={18} strokeWidth={2} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
