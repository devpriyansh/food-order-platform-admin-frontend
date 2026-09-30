import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Users, LogOut, Loader2 } from 'lucide-react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import Orders from './pages/Orders';
import Staff from './pages/Staff';

const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-950 text-red-400">
    <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
    <pre className="mb-6 whitespace-pre-wrap bg-gray-900 p-4 rounded-xl border border-red-900/50 text-sm">{error.message}</pre>
    <button onClick={resetErrorBoundary} className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20">Try Again</button>
  </div>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/foods', icon: UtensilsCrossed, label: 'Menu Catalog' },
    { to: '/orders', icon: ShoppingBag, label: 'Live Orders' },
    ...(user?.role === 'admin' ? [{ to: '/staff', icon: Users, label: 'Staff' }] : [])
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">FoodAdmin</h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{user?.role} Portal</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-950 rounded-xl border border-gray-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-white uppercase">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-950 relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="p-8 relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-orange-500/30">
            <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #374151' } }} />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
              <Route path="/foods" element={<ProtectedLayout><Foods /></ProtectedLayout>} />
              <Route path="/orders" element={<ProtectedLayout><Orders /></ProtectedLayout>} />
              <Route path="/staff" element={<ProtectedLayout><Staff /></ProtectedLayout>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
