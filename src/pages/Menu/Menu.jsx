import { useState, useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import AddMenuItemModal from '../../components/modals/AddMenuItemModal';
import { appCache, clearCache } from '../../utils/cache';

export default function Menu() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clientId } = useAuth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, menuItemId: null });

  const fetchMenu = async (forceRefresh = false) => {
    if (!clientId) return;
    const cacheKey = `menu_${clientId}`;

    if (forceRefresh) {
      clearCache('menu_');
    } else if (appCache.has(cacheKey)) {
      setData(appCache.get(cacheKey));
      setLoading(false);
      return; // Early return to prevent background fetch
    } else {
      setLoading(true);
    }

    try {
      const { data: items, error } = await supabase
        .from('menuItems')
        .select('*')
        .eq('clientId', clientId)
        .is('deletedAt', null)
        .order('menuItemName', { ascending: true });

      if (error) throw error;
      const formattedData = items.map(i => ({
        id: i.menuItemId,
        name: i.menuItemName,
        type: i.mealType,
        price: Number(i.price),
        isAvailable: i.isAvailable
      }));
      
      appCache.set(cacheKey, formattedData);
      setData(formattedData);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [clientId]);

  const confirmSoftDelete = (menuItemId) => {
    setDeleteModal({ isOpen: true, menuItemId });
  };

  const handleSoftDelete = async () => {
    const menuItemId = deleteModal.menuItemId;
    if (!menuItemId) return;

    try {
      const { error } = await supabase
        .from('menuItems')
        .update({ deletedAt: new Date().toISOString() })
        .eq('menuItemId', menuItemId);
        
      if (error) throw error;
      setData(prev => prev.filter(item => item.id !== menuItemId));
      clearCache('menu_');
    } catch (err) {
      console.error('Error soft deleting menu item:', err);
    }
  };

  const toggleAvailability = async (menuItemId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('menuItems')
        .update({ isAvailable: !currentStatus })
        .eq('menuItemId', menuItemId);
        
      if (error) throw error;
      setData(prev => prev.map(item => item.id === menuItemId ? { ...item, isAvailable: !currentStatus } : item));
      clearCache('menu_');
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'Item Name',
        accessorKey: 'name',
        cell: (info) => <span className="font-medium text-text-primary">{info.getValue()}</span>,
      },
      {
        header: 'Meal Type',
        accessorKey: 'type',
        cell: (info) => {
          const type = info.getValue();
          let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
          if (type === 'Breakfast') colorClass = 'bg-amber-100 text-amber-700 border-amber-200';
          if (type === 'Lunch') colorClass = 'bg-brand-100 text-brand-700 border-brand-200';
          if (type === 'Dinner') colorClass = 'bg-indigo-100 text-indigo-700 border-indigo-200';
          
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${colorClass}`}>
              {type}
            </span>
          );
        },
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: (info) => <span className="font-medium text-text-primary">₹{info.getValue().toFixed(2)}</span>,
      },
      {
        header: 'Availability',
        accessorKey: 'isAvailable',
        cell: (info) => {
          const isAvail = info.getValue();
          return (
            <button 
              onClick={() => toggleAvailability(info.row.original.id, isAvail)}
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border ${
                isAvail ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isAvail ? 'Available' : 'Unavailable'}
            </button>
          );
        },
      },
      {
        header: 'Actions',
        id: 'action',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setEditItem(info.row.original)}
              className="text-brand-600 hover:text-brand-800 hover:bg-brand-50 p-1.5 rounded-lg transition-colors"
              title="Edit Item"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={() => confirmSoftDelete(info.row.original.id)}
              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
              title="Move to Trash"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">Menu Management</h2>
          <p className="text-text-secondary mt-1">Manage food items, pricing, and availability.</p>
        </div>
        <button 
          onClick={() => { setEditItem(null); setIsAddModalOpen(true); }}
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white border border-border-subtle shadow-sm rounded-3xl p-6 overflow-hidden min-h-[500px]"
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-text-secondary">Loading menu items...</div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Plus size={32} className="text-slate-300" />
              </div>
              <p className="text-text-secondary">No menu items found. Create one to get started!</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-slate-50 text-text-secondary border-b border-border-subtle">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-4 font-medium">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, menuItemId: null })}
        onConfirm={handleSoftDelete}
        title="Delete Menu Item"
        message="Are you sure you want to move this menu item to Trash? You can restore it later."
        confirmText="Move to Trash"
      />

      <AddMenuItemModal 
        isOpen={isAddModalOpen || !!editItem} 
        onClose={() => { setIsAddModalOpen(false); setEditItem(null); }} 
        onSuccess={fetchMenu}
        editItem={editItem}
      />
    </div>
  );
}
