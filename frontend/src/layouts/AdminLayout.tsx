import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, FolderOpen, Users, BarChart3,
  Menu, X, LogOut, ExternalLink, Bell, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
  { icon: FileText, label: 'Articles', to: '/admin/articles' },
  { icon: FolderOpen, label: 'Categories', to: '/admin/categories' },
  { icon: Users, label: 'Users', to: '/admin/users', adminOnly: true },
  { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-8 border-b border-outline-variant/30">
        <h1 className="font-serif text-xl font-bold text-on-surface">The Newsroom</h1>
        <p className="font-sans text-label-caps text-on-surface-variant mt-1 uppercase tracking-wider">
          {user?.is_admin ? 'Editor-in-Chief' : 'Editor'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && !user?.is_admin) return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-sans text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant/30 space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-sans text-sm font-medium transition-all"
        >
          <ExternalLink size={18} />
          View Site
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-secondary/10 font-sans text-sm font-medium transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-bright dark:bg-[#0f0f0f] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface dark:bg-[#111] border-r border-outline-variant/30 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-surface dark:bg-[#111] border-r border-outline-variant/30 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface dark:bg-[#111] border-b border-outline-variant/30 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container-high"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:block" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-surface-container-high">
              <Bell size={18} className="text-on-surface-variant" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-sans text-sm font-medium text-on-surface hidden sm:block">
                {user?.name}
              </span>
              <ChevronDown size={14} className="text-on-surface-variant" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
