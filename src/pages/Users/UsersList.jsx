import { useState, useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function UsersList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role, clientId } = useAuth(); // Assume we fetch users for this clientId
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });

  useEffect(() => {
    async function fetchUsers() {
      if (!clientId) return;
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select(`
            userId,
            name,
            mobile,
            branches (branchName),
            whatsAppGroups (groupName)
          `)
          .eq('clientId', clientId)
          .is('deletedAt', null)
          .order('name', { ascending: true });

        if (error) throw error;

        const formattedData = users.map(user => ({
          id: user.userId,
          name: user.name,
          mobile: user.mobile,
          branch: user.branches?.branchName || 'Unassigned',
          group: user.whatsAppGroups?.groupName || 'Unassigned',
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [clientId]);

  const confirmSoftDelete = (userId) => {
    setDeleteModal({ isOpen: true, userId });
  };

  const handleSoftDelete = async () => {
    const userId = deleteModal.userId;
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ deletedAt: new Date().toISOString() })
        .eq('userId', userId);
        
      if (error) throw error;
      
      // Remove from UI
      setData(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error soft deleting user:', err);
    }
  };

  const columns = useMemo(
    () => {
      const cols = [
        {
          header: 'User ID',
          accessorKey: 'id',
          cell: (info) => <span className="text-xs text-text-secondary">{info.getValue()}</span>,
        },
        {
          header: 'Name',
          accessorKey: 'name',
          cell: (info) => (
            <Link to={`/users/${info.row.original.id}`} className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
              {info.getValue()}
            </Link>
          ),
        },
        {
          header: 'Mobile No',
          accessorKey: 'mobile',
        },
        {
          header: 'Branch',
          accessorKey: 'branch',
        },
        {
          header: 'WhatsApp Group',
          accessorKey: 'group',
        },
        {
          header: 'Action',
          id: 'action',
          cell: (info) => (
            <div className="flex items-center gap-2">
              <Link 
                to={`/users/${info.row.original.id}`} 
                className="text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                View Profile
              </Link>
              {role === 'Admin' && (
                <button 
                  onClick={() => confirmSoftDelete(info.row.original.id)}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                  title="Move to Trash"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ),
        }
      ];
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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Users</h2>
        <p className="text-text-secondary mt-1">Manage your customers and view their profiles.</p>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-border-subtle shadow-sm rounded-2xl p-6 overflow-hidden"
      >
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-lg font-medium text-text-primary">All Registered Users</h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
              <div className="py-12 text-center text-text-secondary">Loading users...</div>
          ) : data.length === 0 ? (
              <div className="py-12 text-center text-text-secondary">No users found.</div>
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
      </motion.div>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null })}
        onConfirm={handleSoftDelete}
        title="Move to Trash"
        message="Are you sure you want to move this user to Trash? You can restore them later from the Trash page."
        confirmText="Move to Trash"
      />
    </div>
  );
}
