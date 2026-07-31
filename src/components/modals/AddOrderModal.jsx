import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { createPortal } from 'react-dom';

export default function AddOrderModal({ isOpen, onClose, onSuccess }) {
  const { clientId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [formData, setFormData] = useState({
    userId: '',
    menuItemId: '',
    orderDate: new Date().toISOString().split('T')[0],
    quantity: 1,
  });

  useEffect(() => {
    if (isOpen && clientId) {
      // Fetch users
      supabase
        .from('users')
        .select('userId, name')
        .eq('clientId', clientId)
        .is('deletedAt', null)
        .then(({ data }) => setUsers(data || []));

      // Fetch active menu items
      supabase
        .from('menuItems')
        .select('menuItemId, menuItemName, price, mealType')
        .eq('clientId', clientId)
        .is('deletedAt', null)
        .eq('isAvailable', true)
        .then(({ data }) => setMenuItems(data || []));
        
      setFormData({
        userId: '',
        menuItemId: '',
        orderDate: new Date().toISOString().split('T')[0],
        quantity: 1,
      });
      setError(null);
    }
  }, [isOpen, clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.userId || !formData.menuItemId) {
        throw new Error('Please select a user and a menu item.');
      }

      // Fetch user's branchId
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('branchId')
        .eq('userId', formData.userId)
        .single();
        
      if (userError) throw userError;

      const selectedMenu = menuItems.find(m => m.menuItemId === formData.menuItemId);
      if (!selectedMenu) throw new Error('Selected menu item is invalid.');

      const unitPrice = Number(selectedMenu.price);
      const quantity = Number(formData.quantity);
      const totalPrice = unitPrice * quantity;

      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          orderId: `ORD${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
          clientId,
          branchId: userData.branchId,
          userId: formData.userId,
          menuItemId: formData.menuItemId,
          orderDate: formData.orderDate,
          mealType: selectedMenu.mealType,
          quantity,
          unitPrice,
          totalPrice,
          deliveryStatus: 'Pending',
          orderStatus: 'Received'
        });

      if (insertError) throw insertError;
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl shadow-xl border border-border-subtle w-full max-w-lg overflow-hidden z-10"
          >
            <div className="flex items-center justify-between p-6 border-b border-border-subtle">
              <h3 className="text-lg font-bold text-text-primary">Create New Order</h3>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-6 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-100">
                  {error}
                </div>
              )}

              <form id="orderForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Customer</label>
                  <select
                    required
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="" disabled>Select a customer...</option>
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Menu Item</label>
                  <select
                    required
                    name="menuItemId"
                    value={formData.menuItemId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                  >
                    <option value="" disabled>Select a menu item...</option>
                    {menuItems.map(m => (
                      <option key={m.menuItemId} value={m.menuItemId}>
                        {m.menuItemName} ({m.mealType}) - ₹{m.price}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Order Date</label>
                    <input
                      required
                      type="date"
                      name="orderDate"
                      value={formData.orderDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Quantity</label>
                    <input
                      required
                      type="number"
                      name="quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
                
                {formData.menuItemId && (
                  <div className="pt-2">
                    <p className="text-sm text-text-secondary flex justify-between bg-slate-50 p-3 rounded-lg border border-border-subtle">
                      <span>Total Price:</span>
                      <span className="font-bold text-text-primary">
                        ₹{(
                          (menuItems.find(m => m.menuItemId === formData.menuItemId)?.price || 0) * 
                          (formData.quantity || 1)
                        ).toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 border-t border-border-subtle flex justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="orderForm"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm shadow-brand-500/20 disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Create Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
