import { useState, useEffect } from 'react';
import { Bell, Search, LogOut, ChevronDown, Building2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabase';
import { clearCache } from '../../utils/cache';

export default function TopNavbar() {
  const { user, role, clientId, setClientId, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Client Switcher State
  const [clients, setClients] = useState([]);
  const [isClientSwitcherOpen, setIsClientSwitcherOpen] = useState(false);

  // Fetch all clients if the user is a Super Admin
  useEffect(() => {
    async function fetchClients() {
      if (role !== 'Super Admin') return;
      
      try {
        const { data, error } = await supabase
          .from('clientsDetails')
          .select('clientId, businessName')
          .order('businessName', { ascending: true });
          
        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        console.error('Error fetching clients for switcher:', err);
      }
    }
    
    fetchClients();
  }, [role]);

  // Fallback name if user object doesn't have name
  const displayName = user?.name || user?.ownerName || 'Admin User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  // Find currently active client name
  const activeClientName = clients.find(c => c.clientId === clientId)?.businessName || 'Select Client';

  // Handle Client Switch
  const handleClientSwitch = (newClientId) => {
    setClientId(newClientId);
    clearCache(''); // Clear entirely to force refetch of all data (Orders, Menu, etc) for the new client
    setIsClientSwitcherOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-6 px-8 sm:px-10 bg-white rounded-b-3xl mx-4 mt-4 shadow-sm border border-border-subtle border-t-0">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-text-secondary ml-4"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="search-input block h-full w-full border-0 py-0 pl-12 pr-0 focus:ring-0 focus:bg-slate-50 sm:text-sm transition-all duration-300 rounded-2xl"
            placeholder="Search orders, users..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-text-secondary hover:text-text-primary transition-colors relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border-subtle" aria-hidden="true" />

          {/* Client Switcher (Visible only for Super Admin) */}
          {role === 'Super Admin' && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsClientSwitcherOpen(!isClientSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:bg-slate-50 rounded-xl border border-transparent hover:border-border-subtle transition-all"
              >
                <Building2 className="w-4 h-4 text-brand-500" />
                <span className="max-w-[150px] truncate">{activeClientName}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isClientSwitcherOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsClientSwitcherOpen(false)}
                    ></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-lg shadow-slate-200/50 border border-border-subtle focus:outline-none overflow-hidden max-h-80 overflow-y-auto"
                    >
                      <div className="p-2">
                        {clients.map((c) => (
                          <button
                            key={c.clientId}
                            onClick={() => handleClientSwitch(c.clientId)}
                            className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-text-primary hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors"
                          >
                            <span className="truncate pr-2">{c.businessName}</span>
                            {clientId === c.clientId && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Separator for Profile */}
          {role === 'Super Admin' && (
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border-subtle" aria-hidden="true" />
          )}

          {/* Profile dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="-m-1.5 flex items-center p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold border border-brand-200 shadow-sm">
                {displayInitial}
              </div>
              <span className="hidden lg:flex lg:items-center ml-3 text-left">
                <span className="flex flex-col">
                  <span className="text-sm font-semibold leading-5 text-text-primary">
                    {displayName}
                  </span>
                  <span className="text-xs font-medium text-brand-600">
                    {role || 'Administrator'}
                  </span>
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-text-secondary" />
              </span>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-20 mt-2.5 w-48 origin-top-right rounded-xl bg-white py-2 shadow-lg shadow-slate-200/50 border border-border-subtle focus:outline-none"
                  >
                    <div className="px-4 py-2 border-b border-border-subtle mb-1 lg:hidden">
                      <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                      <p className="text-xs text-brand-600">{role || 'Administrator'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
