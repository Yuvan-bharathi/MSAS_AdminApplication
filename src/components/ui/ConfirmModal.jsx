import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = true }) {
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
            className="relative bg-white rounded-2xl shadow-xl border border-border-subtle w-full max-w-md overflow-hidden z-10"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'}`}>
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                </div>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <p className="mt-4 text-sm text-text-secondary ml-11">
                {message}
              </p>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-border-subtle"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-sm ${
                    isDestructive 
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
