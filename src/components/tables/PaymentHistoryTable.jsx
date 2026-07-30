import { useState, useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';

export default function PaymentHistoryTable({ clientId, title = "Payment History", limit, showViewAll = true }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, paymentId: null });

  useEffect(() => {
    async function fetchPayments() {
      if (!clientId) return;
      try {
        let query = supabase
          .from('billPayments')
          .select(`
            paymentId,
            receivedAmount,
            paymentStatus,
            paymentDate,
            users (name),
            monthlyBills (billMonth),
            deletedAt
          `)
          .eq('clientId', clientId)
          .is('deletedAt', null)
          .order('paymentDate', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data: payments, error } = await query;

        if (error) throw error;

        // Map to table format
        const formattedData = payments.map(payment => ({
          id: payment.paymentId,
          user: payment.users?.name || 'Unknown User',
          month: payment.monthlyBills?.billMonth || 'N/A',
          date: payment.paymentDate,
          amount: Number(payment.receivedAmount),
          status: payment.paymentStatus
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, [clientId, limit]);

  const confirmSoftDelete = (paymentId) => {
    setDeleteModal({ isOpen: true, paymentId });
  };

  const handleSoftDelete = async () => {
    const paymentId = deleteModal.paymentId;
    if (!paymentId) return;

    try {
      const { error } = await supabase
        .from('billPayments')
        .update({ deletedAt: new Date().toISOString() })
        .eq('paymentId', paymentId);
        
      if (error) throw error;
      
      // Remove from UI
      setData(prev => prev.filter(p => p.id !== paymentId));
    } catch (err) {
      console.error('Error soft deleting payment:', err);
    }
  };

  const columns = useMemo(
    () => {
      const cols = [
        {
          header: 'Payment ID',
          accessorKey: 'id',
          cell: (info) => <span className="font-medium text-text-primary">{info.getValue()}</span>,
        },
        {
          header: 'User',
          accessorKey: 'user',
        },
        {
          header: 'Bill Month',
          accessorKey: 'month',
        },
        {
          header: 'Received',
          accessorKey: 'amount',
          cell: (info) => <span className="font-medium text-emerald-600">₹{info.getValue().toFixed(2)}</span>,
        },
        {
          header: 'Date',
          accessorKey: 'date',
          cell: (info) => format(parseISO(info.getValue()), 'MMM dd, yyyy'),
        },
        {
          header: 'Status',
          accessorKey: 'status',
          cell: (info) => {
            const status = info.getValue();
            let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
            if (status === 'Success' || status === 'Paid') colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
            if (status === 'Pending') colorClass = 'bg-amber-100 text-amber-700 border-amber-200';
            if (status === 'Partial') colorClass = 'bg-brand-100 text-brand-700 border-brand-200';

            return (
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${colorClass}`}>
                {status}
              </span>
            );
          },
        },
      ];

      if (role === 'Admin') {
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
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary">Recent transactions from your customers.</p>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
            <div className="py-8 text-center text-text-secondary">Loading payment history...</div>
        ) : data.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">No payments found.</div>
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
        onClose={() => setDeleteModal({ isOpen: false, paymentId: null })}
        onConfirm={handleSoftDelete}
        title="Move to Trash"
        message="Are you sure you want to move this payment to Trash? You can restore it later from the Trash page."
        confirmText="Move to Trash"
      />
    </motion.div>
  );
}
