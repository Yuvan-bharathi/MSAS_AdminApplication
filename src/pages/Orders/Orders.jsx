import { useState } from 'react';
import RecentOrdersTable from '../../components/tables/RecentOrdersTable';
import { Plus } from 'lucide-react';
import AddOrderModal from '../../components/modals/AddOrderModal';
import { useAuth } from '../../contexts/AuthContext';

export default function Orders() {
  const { clientId, lastOrderUpdate } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">Orders</h2>
          <p className="text-text-secondary mt-1">Manage your meal subscription orders.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Order
        </button>
      </div>
      <RecentOrdersTable 
        clientId={clientId} 
        limit={null} 
        title="All Orders" 
        showViewAll={false} 
        refreshKey={refreshKey + lastOrderUpdate}
      />
      
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}
