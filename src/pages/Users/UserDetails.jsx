import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { User, Phone, Home, MessageSquare, IndianRupee, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [bill, setBill] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch User Profile with Relations
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, branches(branchName), whatsAppGroups(groupName)')
          .eq('userId', userId)
          .single();
          
        if (userError) throw userError;
        setUser(userData);

        // Fetch their current Monthly Bill (assuming 2026-07)
        const { data: billData, error: billError } = await supabase
          .from('monthlyBills')
          .select('*')
          .eq('userId', userId)
          .eq('billMonth', '2026-07')
          .single();
          
        if (!billError) {
          setBill(billData);
        }

        // Fetch their recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, menuItems(menuItemName)')
          .eq('userId', userId)
          .order('orderDate', { ascending: false })
          .limit(10);
          
        if (!ordersError) {
          setOrders(ordersData);
        }
        
      } catch (err) {
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-12 text-text-secondary">Loading user details...</div>;
  }

  if (!user) {
    return <div className="text-center py-12 text-text-secondary">User not found.</div>;
  }

  // Calculate Paid and Pending logic from bill
  const grandTotal = bill?.grandTotal || 0;
  // If payment status is paid, received is grandTotal. If partial, assume mock received.
  let received = 0;
  if (bill?.paymentStatus === 'Paid') received = grandTotal;
  else if (bill?.paymentStatus === 'Partial') received = grandTotal / 2;
  const pending = grandTotal - received;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{user.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1"><Phone size={16} /> {user.mobile}</span>
              <span className="flex items-center gap-1"><Home size={16} /> {user.branches?.branchName || 'No Branch'}</span>
              <span className="flex items-center gap-1"><MessageSquare size={16} /> {user.whatsAppGroups?.groupName || 'No Group'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2">
                <FileText size={16} /> Generate Invoice
            </button>
            <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm shadow-brand-500/30">
                <IndianRupee size={16} /> Receive Payment
            </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Orders */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
        >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-subtle">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Daily Orders</h3>
                {orders.length === 0 ? (
                    <p className="text-text-secondary text-sm">No recent orders found.</p>
                ) : (
                    <div className="divide-y divide-border-subtle">
                        {orders.map((order) => (
                            <div key={order.orderId} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-text-primary">{order.mealType} - {order.menuItems?.menuItemName}</p>
                                    <p className="text-xs text-text-secondary mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-text-primary">₹{order.totalPrice}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>

        {/* Right Column: Monthly Summary */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
        >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border-subtle">
                <h3 className="text-lg font-semibold text-text-primary mb-6">Monthly Summary (Jul '26)</h3>
                
                {bill ? (
                    <>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Breakfasts</span>
                                <span className="font-medium text-text-primary">{bill.totalBreakfast}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Lunches</span>
                                <span className="font-medium text-text-primary">{bill.totalLunch}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Dinners</span>
                                <span className="font-medium text-text-primary">{bill.totalDinner}</span>
                            </div>
                            <div className="pt-4 border-t border-border-subtle flex justify-between">
                                <span className="font-semibold text-text-primary">Grand Total</span>
                                <span className="font-semibold text-text-primary">₹{grandTotal}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-600 font-medium">Paid</span>
                                <span className="text-emerald-600 font-medium">₹{received}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-amber-600 font-medium">Pending</span>
                                <span className="text-amber-600 font-medium">₹{pending}</span>
                            </div>
                            <div className="pt-3 flex items-center justify-between">
                                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Status</span>
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                    bill.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                    bill.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                                    'bg-rose-100 text-rose-700'
                                }`}>
                                    {bill.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-text-secondary text-sm">No bill generated for this month.</p>
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
}
