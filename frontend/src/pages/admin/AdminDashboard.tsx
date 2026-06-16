import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { adminService } from '../../services/api';
import { Link } from 'react-router-dom';
import { FileText, Users, Eye, FolderOpen, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';
import { Article, Analytics } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics().then(r => r.data.data),
  });

  const stats = [
    { label: 'Total Articles', value: data?.totals.articles ?? 0, icon: FileText, color: '#0f3460', to: '/admin/articles' },
    { label: 'Published', value: data?.totals.published_articles ?? 0, icon: TrendingUp, color: '#05c46b', to: '/admin/articles' },
    { label: 'Total Users', value: data?.totals.users ?? 0, icon: Users, color: '#533483', to: '/admin/users' },
    { label: 'Total Views', value: data?.totals.total_views ?? 0, icon: Eye, color: '#bb0011', to: '/admin/analytics' },
  ];

  return (
    <>
      <Helmet><title>Admin Dashboard — The Daily Cairo</title></Helmet>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-headline-lg">Dashboard</h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1">Welcome to The Daily Cairo Newsroom</p>
          </div>
          <Link to="/admin/articles/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Article
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Link to={stat.to} className="island-card p-6 flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.color + '20' }}>
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div>
                  {isLoading
                    ? <Skeleton className="h-8 w-16 mb-1" />
                    : <p className="font-serif text-2xl font-bold text-on-surface">{stat.value.toLocaleString()}</p>
                  }
                  <p className="font-sans text-xs text-on-surface-variant">{stat.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Articles */}
          <div className="lg:col-span-2 island-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-headline-md">Recent Articles</h2>
              <Link to="/admin/articles" className="flex items-center gap-1 font-sans text-sm text-on-surface-variant hover:text-on-surface">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-14 h-12 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                : data?.recent_articles.map((article: Article) => (
                    <div key={article.id} className="flex items-center gap-4 py-2 border-b border-outline-variant/20 last:border-0">
                      {article.featured_image && (
                        <img src={article.featured_image} alt={article.title} className="w-14 h-12 object-cover rounded-lg shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <Link to={`/admin/articles/edit/${article.id}`} className="font-sans text-sm font-medium text-on-surface hover:text-secondary transition-colors line-clamp-1">
                          {article.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {article.status}
                          </span>
                          <span className="font-sans text-xs text-on-surface-variant">
                            {formatDistanceToNow(new Date(article.created_at!), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-sans text-xs text-on-surface-variant shrink-0">
                        <Eye size={11} /> {article.views_count.toLocaleString()}
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Top Articles + Categories */}
          <div className="space-y-6">
            <div className="island-card p-6">
              <h2 className="font-serif text-headline-md mb-4">By Category</h2>
              <div className="space-y-3">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                  : data?.articles_by_category.slice(0, 6).map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-sans text-sm text-on-surface">{cat.name}</span>
                        </div>
                        <span className="font-sans text-sm font-semibold text-on-surface-variant">
                          {cat.published_articles_count}
                        </span>
                      </div>
                    ))
                }
              </div>
            </div>

            <div className="island-card p-6">
              <h2 className="font-serif text-headline-md mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Write New Article', to: '/admin/articles/new', icon: Plus },
                  { label: 'Manage Categories', to: '/admin/categories', icon: FolderOpen },
                  { label: 'View Analytics', to: '/admin/analytics', icon: TrendingUp },
                ].map(action => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-surface-container-high transition-colors group"
                  >
                    <action.icon size={16} className="text-on-surface-variant group-hover:text-on-surface" />
                    <span className="font-sans text-sm text-on-surface-variant group-hover:text-on-surface">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
