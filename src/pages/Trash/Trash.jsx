import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { RefreshCcw, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function Trash() {
  const { clientId, role } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    if (clientId && role === 'Admin') {
      fetchDeletedItems();
    }
  }, [clientId, activeTab, role]);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('orderId, orderDate, totalPrice, deletedAt, users(name)')
          .eq('clientId', clientId)
          .not('deletedAt', 'is', null)
          .order('deletedAt', { ascending: false });

        if (error) throw error;
        setData(orders.map(o => ({
          id: o.orderId,
          type: 'Order',
          desc: `Order on ${o.orderDate} by ${o.users?.name}`,
          amount: o.totalPrice,
          deletedAt: o.deletedAt
        })));
      } else if (activeTab === 'users') {
        const { data: users, error } = await supabase
          .from('users')
          .select('userId, name, mobile, deletedAt')
          .eq('clientId', clientId)
          .not('deletedAt', 'is', null)
          .order('deletedAt', { ascending: false });

        if (error) throw error;
        setData(users.map(u => ({
          id: u.userId,
          type: 'User',
          desc: `${u.name} (${u.mobile})`,
          amount: null,
          deletedAt: u.deletedAt
        })));
      } else if (activeTab === 'payments') {
        const { data: payments, error } = await supabase
          .from('billPayments')
          .select('paymentId, paymentDate, amountPaid, users(name), deletedAt')
          .eq('clientId', clientId)
          .not('deletedAt', 'is', null)
          .order('deletedAt', { ascending: false });

        if (error) throw error;
        setData(payments.map(p => ({
          id: p.paymentId,
          type: 'Payment',
          desc: `Payment of ₹${p.amountPaid} by ${p.users?.name}`,
          amount: p.amountPaid,
          deletedAt: p.deletedAt
        })));
      }
    } catch (err) {
      console.error('Error fetching trash:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      const table = activeTab === 'orders' ? 'orders' : activeTab === 'users' ? 'users' : 'billPayments';
      const pk = activeTab === 'orders' ? 'orderId' : activeTab === 'users' ? 'userId' : 'paymentId';
      
      const { error } = await supabase
        .from(table)
        .update({ deletedAt: null })
        .eq(pk, id);

      if (error) throw error;
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error restoring:', err);
    }
  };

  const confirmPermanentDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handlePermanentDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;
    
    try {
      const table = activeTab === 'orders' ? 'orders' : activeTab === 'users' ? 'users' : 'billPayments';
      const pk = activeTab === 'orders' ? 'orderId' : activeTab === 'users' ? 'userId' : 'paymentId';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(pk, id);

      if (error) throw error;
      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error permanently deleting:', err);
    }
  };

  if (role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-[600px] text-text-secondary">
        You do not have permission to view the Trash.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Trash</h2>
        <p className="text-text-secondary mt-1">Review soft-deleted items. Restore or permanently delete them.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-border-subtle shadow-sm min-h-[500px]">
        <div className="flex gap-4 border-b border-border-subtle pb-4 mb-6">
          <button 
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-slate-50'}`}
            onClick={() => setActiveTab('orders')}
          >
            Deleted Orders
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'users' ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-slate-50'}`}
            onClick={() => setActiveTab('users')}
          >
            Deleted Users
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'payments' ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-slate-50'}`}
            onClick={() => setActiveTab('payments')}
          >
            Deleted Payments
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-text-secondary">Loading trash...</div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center">
            <Trash2 size={48} className="text-slate-200 mb-4" />
            <p className="text-text-secondary">Trash is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-slate-50 text-text-secondary border-b border-border-subtle">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Deleted On</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {data.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{item.desc}</td>
                    <td className="px-4 py-3">{format(parseISO(item.deletedAt), 'MMM dd, yyyy h:mm a')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleRestore(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <RefreshCcw size={14} /> Restore
                        </button>
                        <button 
                          onClick={() => confirmPermanentDelete(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm shadow-rose-500/20"
                        >
                          <Trash2 size={14} /> Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete"
        message="WARNING: This will permanently delete this record from the database forever. This action cannot be undone. Are you absolutely sure?"
        confirmText="Delete Forever"
        isDestructive={true}
      />
    </div>
  );
}
