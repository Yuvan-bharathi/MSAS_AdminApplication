import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CreditCard, Clock, Users, Settings, LogOut, Trash2, Utensils, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Menu', href: '/menu', icon: Utensils },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Payments', href: '/payments', icon: CreditCard },

  { name: 'Pending Reminder', href: '/reminders', icon: Clock },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Trash', href: '/trash', icon: Trash2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile backdrop - only on very small screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 sm:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <div 
        className={`relative flex h-[calc(100vh-2rem)] shrink-0 flex-col bg-white border border-border-subtle rounded-r-3xl my-4 transform transition-all duration-300 ease-in-out z-50 shadow-sm
        /* Mobile fixed */
        fixed sm:static
        ${isOpen ? 'w-64 translate-x-0 sm:ml-4 sm:mr-0' : 'w-20 -translate-x-[120%] sm:translate-x-0 sm:ml-4 sm:mr-0'}
      `}>
        
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-border-subtle shadow-sm text-text-secondary hover:text-brand-600 transition-colors z-[60] hidden sm:flex"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`flex h-20 shrink-0 items-center overflow-hidden transition-all duration-300 ${isOpen ? 'px-6' : 'px-0 justify-center'}`}>
          <h1 className="text-2xl font-bold text-brand-600 whitespace-nowrap">
            {isOpen ? 'MSAS Dash' : 'M'}
          </h1>
        </div>
        
        <nav className="flex flex-1 flex-col px-3 pb-4 overflow-y-auto overflow-x-hidden">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={() => {
                        if (window.innerWidth < 640) setIsOpen(false);
                      }}
                      className={({ isActive }) =>
                        `relative group flex items-center rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-300 ${
                          isOpen ? 'justify-start' : 'justify-center'
                        } ${
                          isActive
                            ? 'bg-brand-50 text-brand-600 border border-brand-100 shadow-sm'
                            : 'text-text-secondary hover:text-brand-600 hover:bg-slate-50'
                        }`
                      }
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      
                      {/* Nav Text */}
                      <span 
                        className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                          isOpen ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0 ml-0'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Tooltip (Only visible when sidebar is closed) */}
                      {!isOpen && (
                        <div className="absolute left-full ml-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap z-[100] transition-all duration-200">
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
