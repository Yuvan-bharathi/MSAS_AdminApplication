import { useMemo, useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';
import { appCache, clearCache } from '../../utils/cache';

const StatusDropdown = ({ status, orderId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  if (status === 'Delivered') colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (status === 'Pending') colorClass = 'bg-amber-100 text-amber-700 border-amber-200';
  if (status === 'Preparing' || status === 'Ready') colorClass = 'bg-brand-100 text-brand-700 border-brand-200';
  if (status === 'Cancelled' || status === 'Not Delivered') colorClass = 'bg-rose-100 text-rose-700 border-rose-200';

  const options = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Not Delivered', 'Cancelled'];

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 ${colorClass}`}
      >
        {status}
        <ChevronDown size={12} className="opacity-70" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-20 mt-1 w-32 rounded-xl bg-white shadow-lg shadow-slate-200/50 border border-border-subtle overflow-hidden py-1">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  onChange(orderId, opt);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === opt ? 'bg-brand-50 text-brand-700' : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function RecentOrdersTable({ clientId, title = "Recent Orders", limit, showViewAll = true, refreshKey = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth(); // Fetch user role to conditionally show delete button
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null });

  useEffect(() => {
    async function fetchOrders() {
      if (!clientId) return;

      const cacheKey = `orders_${clientId}_${limit || 'all'}`;

      if (refreshKey > 0) {
        clearCache('orders_');
      } else if (appCache.has(cacheKey)) {
        setData(appCache.get(cacheKey));
        setLoading(false);
        return; // Early return to prevent background fetch
      }

      try {
        let query = supabase
          .from('orders')
          .select(`
            orderId,
            orderDate,
            createdAt,
            totalPrice,
            orderStatus,
            mealType,
            userId,
            users (name),
            menuItems (menuItemName)
          `)
          .eq('clientId', clientId)
          .is('deletedAt', null) // Filter out soft-deleted
          .order('createdAt', { ascending: false });
          
        if (limit) {
          query = query.limit(limit);
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        // Map to table format
        const formattedData = orders.map(order => ({
          id: order.orderId,
          userId: order.userId,
          user: order.users?.name || 'Unknown User',
          plan: order.menuItems?.menuItemName || 'Unknown Plan',
          mealType: order.mealType || '-',
          orderedFor: parseISO(order.orderDate),
          orderedOn: parseISO(order.createdAt),
          amount: Number(order.totalPrice),
          status: order.orderStatus
        }));

        appCache.set(cacheKey, formattedData);
        setData(formattedData);
      } catch (err) {
        console.error('Error fetching recent orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [clientId, limit, refreshKey]);

  const handleStatusChange = async (orderId, newStatus) => {
    setData(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    try {
      const { error } = await supabase
        .from('orders')
        .update({ orderStatus: newStatus })
        .eq('orderId', orderId);
        
      if (error) throw error;
      
      clearCache('orders_');
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const confirmSoftDelete = (orderId) => {
    setDeleteModal({ isOpen: true, orderId });
  };

  const handleSoftDelete = async () => {
    const orderId = deleteModal.orderId;
    if (!orderId) return;

    try {
      // 1. Fetch order details to deduct from monthly bill
      const { data: orderDetails, error: fetchError } = await supabase
        .from('orders')
        .select('userId, totalPrice, orderDate, mealType')
        .eq('orderId', orderId)
        .single();
        
      if (fetchError) throw fetchError;

      // 2. Soft delete the order
      const { error } = await supabase
        .from('orders')
        .update({ deletedAt: new Date().toISOString() })
        .eq('orderId', orderId);
        
      if (error) throw error;
      
      // 3. Deduct from monthly bill
      const billMonth = format(parseISO(orderDetails.orderDate), 'yyyy-MM');
      const { data: bill } = await supabase
        .from('monthlyBills')
        .select('*')
        .eq('userId', orderDetails.userId)
        .eq('billMonth', billMonth)
        .maybeSingle();

      if (bill) {
        const mealColumn = 
          orderDetails.mealType === 'Breakfast' ? 'totalBreakfast' :
          orderDetails.mealType === 'Lunch' ? 'totalLunch' :
          orderDetails.mealType === 'Dinner' ? 'totalDinner' : null;

        const updateData = {
          subtotal: Math.max(0, Number(bill.subtotal) - Number(orderDetails.totalPrice)),
          grandTotal: Math.max(0, Number(bill.grandTotal) - Number(orderDetails.totalPrice)),
          totalMeals: Math.max(0, Number(bill.totalMeals) - 1),
        };
        
        if (mealColumn) {
          updateData[mealColumn] = Math.max(0, Number(bill[mealColumn]) - 1);
        }

        await supabase
          .from('monthlyBills')
          .update(updateData)
          .eq('billId', bill.billId);
      }

      // Remove from UI
      setData(prev => prev.filter(order => order.id !== orderId));
      clearCache('orders_');
      setDeleteModal({ isOpen: false, orderId: null });
    } catch (err) {
      console.error('Error soft deleting order:', err);
    }
  };

  const columns = useMemo(
    () => {
      const cols = [
        {
          header: 'Order ID',
          accessorKey: 'id',
          cell: (info) => <span className="font-medium text-text-primary">{info.getValue()}</span>,
        },
        {
          header: 'User',
          accessorKey: 'user',
          cell: (info) => (
            <Link to={`/users/${info.row.original.userId}`} className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
              {info.getValue()}
            </Link>
          ),
        },
        {
          header: 'Plan',
          accessorKey: 'plan',
        },
        {
          header: 'Meal',
          accessorKey: 'mealType',
        },
        {
          header: 'Ordered For',
          accessorKey: 'orderedFor',
          cell: (info) => {
              try {
                  return format(info.getValue(), 'MMM dd, yyyy');
              } catch (e) {
                  return 'Invalid Date';
              }
          },
        },
        {
          header: 'Ordered On',
          accessorKey: 'orderedOn',
          cell: (info) => {
              try {
                  return format(info.getValue(), 'MMM dd, yyyy');
              } catch (e) {
                  return 'Invalid Date';
              }
          },
        },
        {
          header: 'Amount',
          accessorKey: 'amount',
          cell: (info) => `₹${info.getValue().toFixed(2)}`,
        },
        {
          header: 'Status',
          accessorKey: 'status',
          cell: (info) => {
            const status = info.getValue();
            const orderId = info.row.original.id;
            return <StatusDropdown status={status} orderId={orderId} onChange={handleStatusChange} />;
          },
        }
      ];

      if (role === 'Admin' || role === 'Super Admin') {
        cols.push({
          header: 'Action',
          id: 'action',
          cell: (info) => (
            <button 
              onClick={() => confirmSoftDelete(info.row.original.id)}
              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
              title="Move to Trash"
            >
              <Trash2 size={16} />
            </button>
          ),
        });
      }

      return cols;
    },
    [role]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-white border border-border-subtle shadow-sm rounded-2xl p-6 mt-8 overflow-hidden"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary">Latest transactions from your customers.</p>
        </div>
        {showViewAll && (
          <Link to="/orders" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            View All
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        {loading ? (
            <div className="py-8 text-center text-text-secondary">Loading orders...</div>
        ) : data.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">No orders found.</div>
        ) : (
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-slate-50 text-text-secondary border-b border-border-subtle">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-4 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
                    <td key={cell.id} className="px-4 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
        onConfirm={handleSoftDelete}
        title="Move to Trash"
        message="Are you sure you want to move this order to the trash? You can restore it later."
        confirmText="Move to Trash"
        type="danger"
      />
    </motion.div>
  );
}
