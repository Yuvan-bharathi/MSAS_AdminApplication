import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ChevronDown } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { createPortal } from 'react-dom';

export default function AddMenuItemModal({ isOpen, onClose, onSuccess, editItem }) {
  const { clientId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Breakfast & Dinner"];

  const [formData, setFormData] = useState({
    menuItemName: '',
    mealType: 'Breakfast',
    price: '',
    isAvailable: true
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        menuItemName: editItem.name,
        mealType: editItem.type,
        price: editItem.price.toString(),
        isAvailable: editItem.isAvailable
      });
    } else {
      setFormData({
        menuItemName: '',
        mealType: 'Breakfast',
        price: '',
        isAvailable: true
      });
    }
    setError(null);
  }, [isOpen, editItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editItem) {
        const { error: updateError } = await supabase
          .from('menuItems')
          .update({
            menuItemName: formData.menuItemName,
            mealType: formData.mealType,
            price: Number(formData.price),
            isAvailable: formData.isAvailable
          })
          .eq('menuItemId', editItem.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('menuItems')
          .insert({
            menuItemId: `MNU${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            clientId: clientId,
            menuItemName: formData.menuItemName,
            mealType: formData.mealType,
            price: Number(formData.price),
            isAvailable: formData.isAvailable
          });

        if (insertError) throw insertError;
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving menu item:', err);
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
              <h3 className="text-lg font-bold text-text-primary">
                {editItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
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

              <form id="menuForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Item Name</label>
                  <input
                    required
                    type="text"
                    name="menuItemName"
                    value={formData.menuItemName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    placeholder="e.g. Aloo Paratha"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-text-primary mb-1">Meal Type</label>
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                    >
                      <span className="text-text-primary">{formData.mealType}</span>
                      <ChevronDown size={16} className={`text-text-secondary transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                          <motion.div
                             initial={{ opacity: 0, y: -5 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -5 }}
                             transition={{ duration: 0.15 }}
                             className="absolute z-20 w-full mt-1.5 bg-white border border-border-subtle rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden"
                          >
                             {mealTypes.map(type => (
                               <div 
                                 key={type}
                                 onClick={() => {
                                   handleChange({ target: { name: 'mealType', value: type, type: 'text' } });
                                   setIsDropdownOpen(false);
                                 }}
                                 className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                                   formData.mealType === type ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-slate-50 text-text-primary'
                                 }`}
                               >
                                 {type}
                               </div>
                             ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Price (₹)</label>
                    <input
                      required
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      placeholder="50.00"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="w-4 h-4 text-brand-600 border-border-subtle rounded focus:ring-brand-500"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-medium text-text-primary">
                    Currently Available
                  </label>
                </div>
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
                form="menuForm"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm shadow-brand-500/20 disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {editItem ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
