import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-400 font-medium">{title}</h3>
      <div className="p-2 bg-gray-800/50 rounded-lg text-orange-500">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <p className="text-3xl font-bold text-white">{value}</p>
      {trend && <span className="text-sm font-medium text-emerald-400">{trend}</span>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/orders/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}</h1>
        <p className="text-gray-400">Here's what's happening with your restaurant today.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Orders" value={metrics?.totalCount || 0} icon={ShoppingBag} />
          <StatCard title="Placed" value={metrics?.Placed || 0} icon={Activity} />
          <StatCard title="Accepted" value={metrics?.Accepted || 0} icon={Activity} />
          <StatCard title="Preparing" value={metrics?.Preparing || 0} icon={Activity} />
          <StatCard title="Ready" value={metrics?.Ready || 0} icon={Activity} />
          <StatCard title="Completed" value={metrics?.Completed || 0} icon={Activity} />
          <StatCard title="Cancelled" value={metrics?.Cancelled || 0} icon={Activity} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
