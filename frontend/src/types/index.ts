export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  email_verified_at?: string;
  roles: string[];
  is_admin: boolean;
  is_editor: boolean;
  is_banned?: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  order: number;
  published_articles_count?: number;
}

export interface Article {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  category?: Category;
  author?: {
    id: number;
    name: string;
    avatar: string;
  };
  tags?: string[];
  views_count: number;
  read_time: number;
  is_breaking: boolean;
  is_trending: boolean;
  is_featured?: boolean;
  status?: string;
  published_at?: string;
  created_at?: string;
  meta_title?: string;
  meta_description?: string;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  replies?: Comment[];
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface Analytics {
  totals: {
    articles: number;
    published_articles: number;
    draft_articles: number;
    users: number;
    comments: number;
    categories: number;
    total_views: number;
  };
  recent_articles: Article[];
  top_articles: Article[];
  recent_users: User[];
  articles_by_category: (Category & { published_articles_count: number })[];
}
