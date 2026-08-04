import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Orders from './pages/Orders/Orders';
import Payments from './pages/Payments/Payments';
import UserDetails from './pages/Users/UserDetails';
import UsersList from './pages/Users/UsersList';
import PendingReminder from './pages/PendingReminder/PendingReminder';
import Settings from './pages/Settings/Settings';
import Trash from './pages/Trash/Trash';
import Menu from './pages/Menu/Menu';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="menu" element={<Menu />} />
              <Route path="users" element={<UsersList />} />
              <Route path="users/:userId" element={<UserDetails />} />
              <Route path="reminders" element={<PendingReminder />} />
              <Route path="trash" element={<Trash />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
