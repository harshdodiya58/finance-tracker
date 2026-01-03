import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('transactions')) return 'Transactions';
    if (path.includes('budgets')) return 'Budgets';
    if (path.includes('investments')) return 'Investments';
    if (path.includes('profile')) return 'Profile';
    return 'Finance Tracker';
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-8 bg-white shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu button (optional) */}
        <button className="lg:hidden p-2 rounded-md hover:bg-gray-100" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-transparent outline-none text-sm w-64"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-purple-50 transition-colors">
          <Bell className="w-6 h-6 text-purple-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* User Info */}
        <div className="hidden md:flex flex-col items-end">
          <span className="font-semibold text-gray-800 text-sm">{user?.name}</span>
          <span className="text-xs text-gray-500">Welcome back!</span>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg ml-2 shadow-md">
          {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
        </div>
      </div>
    </header>
  );
};

export default Header;
