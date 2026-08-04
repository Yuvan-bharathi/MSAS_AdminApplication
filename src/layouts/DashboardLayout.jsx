import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import TopNavbar from '../components/navbar/TopNavbar';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <TopNavbar toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
