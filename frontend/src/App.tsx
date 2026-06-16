import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Public pages
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// User dashboard
import UserDashboard from './pages/user/UserDashboard';
import BookmarksPage from './pages/user/BookmarksPage';
import HistoryPage from './pages/user/HistoryPage';
import ProfilePage from './pages/user/ProfilePage';
import NotificationsPage from './pages/user/NotificationsPage';

// Admin dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import AdminArticleFormPage from './pages/admin/AdminArticleFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// Route guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

export default function App() {
  const { isDark, setTheme } = useThemeStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Apply saved theme on mount
    setTheme(isDark);
    // Verify stored token is still valid
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/"               element={<HomePage />} />
        <Route path="/article/:slug"  element={<ArticleDetailPage />} />
        <Route path="/categories"     element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/search"         element={<SearchPage />} />
        <Route path="/about"          element={<AboutPage />} />
        <Route path="/contact"        element={<ContactPage />} />
        <Route path="/privacy"        element={<PrivacyPage />} />
      </Route>

      {/* ── Auth routes ────────────────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login"          element={<LoginPage />} />
        <Route path="/auth/register"       element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password"  element={<ResetPasswordPage />} />
      </Route>

      {/* ── User dashboard (requires login) ───────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard"               element={<UserDashboard />} />
          <Route path="/dashboard/bookmarks"     element={<BookmarksPage />} />
          <Route path="/dashboard/history"       element={<HistoryPage />} />
          <Route path="/dashboard/profile"       element={<ProfilePage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* ── Admin dashboard (requires admin or editor role) ───────────── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"                    element={<AdminDashboard />} />
          <Route path="/admin/articles"           element={<AdminArticlesPage />} />
          <Route path="/admin/articles/new"       element={<AdminArticleFormPage />} />
          <Route path="/admin/articles/edit/:id"  element={<AdminArticleFormPage />} />
          <Route path="/admin/categories"         element={<AdminCategoriesPage />} />
          <Route path="/admin/users"              element={<AdminUsersPage />} />
          <Route path="/admin/analytics"          element={<AdminAnalyticsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
