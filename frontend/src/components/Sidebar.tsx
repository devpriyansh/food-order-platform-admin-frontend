import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        
        <nav style={{ flex: 1 }}>
          <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Orders
          </NavLink>
          <NavLink to="/foods" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Food Catalog
          </NavLink>
          {isAdmin && (
            <NavLink to="/staff" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Staff Management
            </NavLink>
          )}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div className="mb-4">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Logged in as</div>
            <div style={{ fontWeight: 500 }}>{user?.name}</div>
            <span className="badge badge-active" style={{ display: 'inline-block', marginTop: '4px' }}>
              {user?.role}
            </span>
          </div>
          
          <button onClick={logout} className="btn btn-danger" style={{ width: '100%' }}>
            Sign Out
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
