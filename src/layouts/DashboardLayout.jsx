import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import TopNavbar from '../components/navbar/TopNavbar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
