import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CreditCard, Clock, Users, Settings, LogOut, Trash2, Utensils } from 'lucide-react';
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

export default function Sidebar() {
  const { signOut } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-white border border-border-subtle shadow-sm rounded-r-3xl my-4 ml-4">
      <div className="flex h-20 shrink-0 items-center px-6">
        <h1 className="text-2xl font-bold text-brand-600">MSAS Dash</h1>
      </div>
      <nav className="flex flex-1 flex-col px-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-300 ${
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
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          {/* <li className="mt-auto">
            <button
              onClick={signOut}
              className="w-full group -mx-2 flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-all duration-300"
            >
              <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
              Logout
            </button>
          </li> */}
        </ul>
      </nav>
    </div>
  );
}
