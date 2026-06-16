import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, X, Sun, Moon, User, LogOut,
  LayoutDashboard, BookmarkIcon, History, Bell,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/api';
import { mockCategories } from '../../data/mockArticles';
import { Category } from '../../types';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef  = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* Close user menu on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* Close menu on navigation */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  /* Focus search input when opened */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  /* Categories */
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryService.getAll().then(r => r.data.data),
    staleTime: 3_600_000,
    retry: 1,
  });

  const categories: Category[] = (catData ?? mockCategories).slice(0, 5);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky-nav z-50">
      <div className="max-w-[1440px] mx-auto px-5 md:px-12">
        <div className="flex items-center justify-between h-20">

          {/* Left — desktop category links */}
          <div className="hidden lg:flex items-center gap-6">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Center — Logo */}
          <Link
            to="/"
            className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-on-surface absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            The Daily Cairo
          </Link>

          {/* Right — Actions */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
              aria-label="Search"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 rounded-full border border-outline-variant/50 pl-1 pr-3 py-1 hover:bg-surface-container-high transition-all"
                >
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="hidden sm:block font-sans text-sm font-medium text-on-surface max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest dark:bg-[#1a1a2e] border border-outline-variant/30 rounded-xl shadow-lg py-2 z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-outline-variant/20 mb-1">
                        <p className="font-sans text-sm font-semibold text-on-surface leading-none">{user.name}</p>
                        <p className="font-sans text-xs text-on-surface-variant mt-0.5 truncate">{user.email}</p>
                        {user.roles.length > 0 && (
                          <span className="inline-block mt-1.5 font-sans text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                            {user.roles[0]}
                          </span>
                        )}
                      </div>

                      {/* Menu items */}
                      {(user.is_admin || user.is_editor) && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                          <LayoutDashboard size={15} /> Newsroom Admin
                        </Link>
                      )}
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                        <User size={15} /> My Dashboard
                      </Link>
                      <Link to="/dashboard/bookmarks" className="flex items-center gap-3 px-4 py-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                        <BookmarkIcon size={15} /> Bookmarks
                      </Link>
                      <Link to="/dashboard/history" className="flex items-center gap-3 px-4 py-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                        <History size={15} /> Reading History
                      </Link>
                      <Link to="/dashboard/notifications" className="flex items-center gap-3 px-4 py-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                        <Bell size={15} /> Notifications
                      </Link>
                      <div className="border-t border-outline-variant/20 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 font-sans text-sm text-secondary hover:bg-secondary/10 transition-colors"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/auth/login" className="btn-ghost py-1.5 px-4 text-xs">Login</Link>
                <Link to="/auth/register" className="btn-primary py-1.5 px-4 text-xs">Subscribe</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-outline-variant/30 overflow-hidden"
          >
            <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={18} className="text-on-surface-variant shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, categories..."
                  className="flex-1 bg-transparent font-sans text-sm text-on-surface placeholder:text-on-surface-variant outline-none"
                />
                {searchQuery && (
                  <button
                    type="submit"
                    disabled={searchQuery.trim().length < 2}
                    className="btn-primary py-1.5 px-4 text-xs disabled:opacity-40"
                  >
                    Search
                  </button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-outline-variant/30 md:hidden overflow-hidden"
          >
            <nav className="px-5 py-4 space-y-1">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex items-center gap-3 py-2.5 px-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </Link>
              ))}
              <Link to="/categories" className="flex items-center gap-3 py-2.5 px-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors">
                All Topics →
              </Link>
              <Link to="/about" className="flex items-center gap-3 py-2.5 px-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors">
                About
              </Link>
              <Link to="/contact" className="flex items-center gap-3 py-2.5 px-2 font-sans text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors">
                Contact
              </Link>
              {!isAuthenticated && (
                <div className="pt-3 flex gap-2 border-t border-outline-variant/20">
                  <Link to="/auth/login" className="btn-ghost py-2 px-4 text-sm flex-1 text-center">Login</Link>
                  <Link to="/auth/register" className="btn-primary py-2 px-4 text-sm flex-1 text-center">Subscribe</Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
