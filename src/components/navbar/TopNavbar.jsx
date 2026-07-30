import { Bell, Search, User } from 'lucide-react';

export default function TopNavbar() {
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

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-4">
            <button className="-m-1.5 flex items-center p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
              <span className="sr-only">Open user menu</span>
              <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold border border-brand-200">
                A
              </div>
              <span className="hidden lg:flex lg:items-center ml-3">
                <span className="text-sm font-semibold leading-6 text-text-primary" aria-hidden="true">
                  Admin User
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
