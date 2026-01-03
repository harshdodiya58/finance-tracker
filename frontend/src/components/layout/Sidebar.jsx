import { Link, useLocation } from 'react-router-dom';
import { Wallet, BarChart2, List, PieChart, User, LogOut, PiggyBank } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 /> },
  { name: 'Transactions', path: '/transactions', icon: <List /> },
  { name: 'Budgets', path: '/budgets', icon: <PieChart /> },
  { name: 'Investments', path: '/investments', icon: <PiggyBank /> },
  { name: 'Profile', path: '/profile', icon: <User /> },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <aside className="h-screen w-64 bg-white shadow-card flex flex-col justify-between fixed z-20">
      <div>
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-6 py-6 border-b border-gray-100"
        >
          <div className="bg-gradient-primary p-2.5 rounded-xl shadow-lg">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text block">Finance</span>
            <span className="text-xs text-gray-500">Tracker</span>
          </div>
        </motion.div>
        
        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navLinks.map((link, idx) => {
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                      isActive
                        ? 'bg-gradient-primary text-white shadow-lg'
                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : ''}`}>{link.icon}</span>
                    {link.name}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* User Profile & Logout */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-4 py-4 border-t border-gray-100"
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="bg-gradient-primary text-white rounded-full w-11 h-11 flex items-center justify-center font-bold text-base shadow-md">
            {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-sm truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </aside>
  );
};

export default Sidebar;
