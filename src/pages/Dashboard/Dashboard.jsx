import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/cards/StatCard';
import RevenueChart from '../../components/charts/RevenueChart';
import DistributionChart from '../../components/charts/DistributionChart';
import RecentOrdersTable from '../../components/tables/RecentOrdersTable';
import { ShoppingBag, DollarSign, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';

export default function Dashboard() {
  const { clientId, lastOrderUpdate } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    pending: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  // Re-fetch stats when the page loads OR when a new order comes in
  useEffect(() => {
    async function fetchDashboardStats() {
      if (!clientId) return;
      try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Today's Orders & Revenue
        const { data: todayOrders, error: todayError } = await supabase
          .from('orders')
          .select('totalPrice')
          .eq('clientId', clientId)
          .eq('orderDate', todayStr);

        if (todayError) throw todayError;

        const totalOrders = todayOrders.length;
        const totalRevenue = todayOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0);

        // 2. Pending Payments
        const { count: pendingCount, error: pendingError } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('clientId', clientId)
          .eq('paymentStatus', 'Pending');
          
        if (pendingError) throw pendingError;

        // 3. Delivered Orders
        const { count: deliveredCount, error: deliveredError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('clientId', clientId)
          .eq('deliveryStatus', 'Delivered');

        if (deliveredError) throw deliveredError;

        setStats({
          orders: totalOrders,
          revenue: totalRevenue,
          pending: pendingCount || 0,
          delivered: deliveredCount || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [clientId, lastOrderUpdate]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Dashboard</h2>
        <p className="text-text-secondary mt-1">Overview of your meal subscription system.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Orders"
          value={loading ? '...' : stats.orders}
          change="+12.5%"
          changeType="positive"
          icon={ShoppingBag}
          delay={0.1}
        />
        <StatCard
          title="Today's Revenue"
          value={loading ? '...' : `₹${stats.revenue.toLocaleString()}`}
          change="+8.2%"
          changeType="positive"
          icon={DollarSign}
          delay={0.2}
        />
        <StatCard
          title="Pending Payments"
          value={loading ? '...' : stats.pending}
          change="-2.4%"
          changeType="negative"
          icon={CreditCard}
          delay={0.3}
        />
        <StatCard
          title="Delivered Orders"
          value={loading ? '...' : stats.delivered}
          change="+18.1%"
          changeType="positive"
          icon={CheckCircle}
          delay={0.4}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <DistributionChart />
        </div>
      </div>
      <RecentOrdersTable clientId={clientId} limit={10} refreshKey={lastOrderUpdate} />
    </div>
  );
}
