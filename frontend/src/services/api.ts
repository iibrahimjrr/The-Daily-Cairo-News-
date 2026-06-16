import axios, { AxiosInstance, AxiosError } from 'axios';

// ─── Axios Instance ──────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Token-based auth — no cookies needed
});

// ─── Request Interceptor — Attach Sanctum Bearer Token ───────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Handle Errors ────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → clear storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
      if (!publicPaths.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Register a new user.
   * Returns: { message, user, token }
   */
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => api.post('/auth/register', data),

  /**
   * Login with email + password.
   * Returns: { message, user, token }
   */
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  /**
   * Logout — revoke current Sanctum token.
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Get the currently authenticated user.
   * Returns: { user }
   */
  me: () => api.get('/auth/me'),

  /**
   * Send a password reset link to the given email.
   */
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  /**
   * Reset the password using the token from the email link.
   */
  resetPassword: (data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => api.post('/auth/reset-password', data),

  /**
   * Resend the email verification link.
   */
  resendVerification: () => api.post('/auth/resend-verification'),
};

// ─── Article Service ──────────────────────────────────────────────────────────

export const articleService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/articles', { params }),
  getOne: (slug: string) =>
    api.get(`/articles/${slug}`),
  getFeatured: () =>
    api.get('/articles/featured'),
  getBreaking: () =>
    api.get('/articles/breaking'),
  getTrending: () =>
    api.get('/articles/trending'),
  getRelated: (slug: string) =>
    api.get(`/articles/${slug}/related`),
  incrementView: (id: number) =>
    api.post(`/articles/${id}/view`),
};

// ─── Category Service ─────────────────────────────────────────────────────────

export const categoryService = {
  getAll: () =>
    api.get('/categories'),
  getOne: (slug: string) =>
    api.get(`/categories/${slug}`),
  getArticles: (slug: string, params?: Record<string, unknown>) =>
    api.get(`/categories/${slug}/articles`, { params }),
};

// ─── Search Service ───────────────────────────────────────────────────────────

export const searchService = {
  search: (q: string, params?: Record<string, unknown>) =>
    api.get('/search', { params: { q, ...params } }),
};

// ─── User Service ─────────────────────────────────────────────────────────────

export const userService = {
  getProfile: () =>
    api.get('/user/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    api.put('/user/profile', data),
  updateAvatar: (formData: FormData) =>
    api.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePassword: (data: Record<string, unknown>) =>
    api.put('/user/password', data),

  // Bookmarks
  getBookmarks: (params?: Record<string, unknown>) =>
    api.get('/user/bookmarks', { params }),
  addBookmark: (articleId: number) =>
    api.post(`/user/bookmarks/${articleId}`),
  removeBookmark: (articleId: number) =>
    api.delete(`/user/bookmarks/${articleId}`),

  // Reading history
  getHistory: (params?: Record<string, unknown>) =>
    api.get('/user/history', { params }),
  addToHistory: (articleId: number) =>
    api.post(`/user/history/${articleId}`),
  clearHistory: () =>
    api.delete('/user/history'),

  // Notifications
  getNotifications: () =>
    api.get('/user/notifications'),
  markNotificationRead: (id: string) =>
    api.post(`/user/notifications/${id}/read`),
  markAllRead: () =>
    api.post('/user/notifications/read-all'),
};

// ─── Comment Service ──────────────────────────────────────────────────────────

export const commentService = {
  getComments: (articleId: number) =>
    api.get(`/articles/${articleId}/comments`),
  addComment: (
    articleId: number,
    data: { content: string; parent_id?: number }
  ) => api.post(`/articles/${articleId}/comments`, data),
  updateComment: (id: number, content: string) =>
    api.put(`/comments/${id}`, { content }),
  deleteComment: (id: number) =>
    api.delete(`/comments/${id}`),
};

// ─── Admin Service ────────────────────────────────────────────────────────────

export const adminService = {
  // Articles
  getArticles: (params?: Record<string, unknown>) =>
    api.get('/admin/articles', { params }),
  getArticle: (id: number) =>
    api.get(`/admin/articles/${id}`),
  createArticle: (data: Record<string, unknown>) =>
    api.post('/admin/articles', data),
  updateArticle: (id: number, data: Record<string, unknown>) =>
    api.put(`/admin/articles/${id}`, data),
  deleteArticle: (id: number) =>
    api.delete(`/admin/articles/${id}`),
  publishArticle: (id: number) =>
    api.post(`/admin/articles/${id}/publish`),
  unpublishArticle: (id: number) =>
    api.post(`/admin/articles/${id}/unpublish`),
  setBreaking: (id: number, isBreaking: boolean) =>
    api.post(`/admin/articles/${id}/breaking`, { is_breaking: isBreaking }),
  setTrending: (id: number, isTrending: boolean) =>
    api.post(`/admin/articles/${id}/trending`, { is_trending: isTrending }),
  uploadImage: (formData: FormData) =>
    api.post('/admin/articles/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Categories
  getCategories: () =>
    api.get('/admin/categories'),
  createCategory: (data: Record<string, unknown>) =>
    api.post('/admin/categories', data),
  updateCategory: (id: number, data: Record<string, unknown>) =>
    api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) =>
    api.delete(`/admin/categories/${id}`),

  // Users (admin only)
  getUsers: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }),
  getUser: (id: number) =>
    api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: Record<string, unknown>) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) =>
    api.delete(`/admin/users/${id}`),
  assignRole: (id: number, role: string) =>
    api.post(`/admin/users/${id}/role`, { role }),
  banUser: (id: number, reason?: string) =>
    api.post(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id: number) =>
    api.post(`/admin/users/${id}/unban`),

  // Analytics
  getAnalytics: () =>
    api.get('/admin/analytics'),
  getArticleAnalytics: () =>
    api.get('/admin/analytics/articles'),
  getUserAnalytics: () =>
    api.get('/admin/analytics/users'),
};
