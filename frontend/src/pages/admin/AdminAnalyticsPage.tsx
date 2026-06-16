import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminService } from '../../services/api';
import { Analytics } from '../../types';
import { FileText, Users, Eye, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalytics().then(r => r.data.data),
  });

  const stats = [
    { label: 'Total Articles', value: data?.totals.articles, icon: FileText, color: '#0f3460' },
    { label: 'Published', value: data?.totals.published_articles, icon: TrendingUp, color: '#05c46b' },
    { label: 'Drafts', value: data?.totals.draft_articles, icon: BarChart3, color: '#f8b739' },
    { label: 'Total Users', value: data?.totals.users, icon: Users, color: '#533483' },
    { label: 'Comments', value: data?.totals.comments, icon: MessageSquare, color: '#0fbcf9' },
    { label: 'Total Views', value: data?.totals.total_views, icon: Eye, color: '#bb0011' },
  ];

  return (
    <>
      <Helmet><title>Analytics — Admin Dashboard</title></Helmet>
      <div className="space-y-8">
        <h1 className="font-serif text-headline-lg">Analytics</h1>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="island-card p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.color + '20' }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                {isLoading
                  ? <Skeleton className="h-7 w-14 mb-1" />
                  : <p className="font-serif text-2xl font-bold">{(stat.value ?? 0).toLocaleString()}</p>
                }
                <p className="font-sans text-xs text-on-surface-variant">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top articles */}
          <div className="island-card p-6">
            <h2 className="font-serif text-headline-md mb-5">Top Performing Articles</h2>
            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                : data?.top_articles.map((article, i) => (
                    <div key={article.id} className="flex items-center gap-3">
                      <span className="font-sans text-2xl font-bold text-on-surface-variant/30 w-8 shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-on-surface line-clamp-1">{article.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {article.category && (
                            <span className="font-sans text-xs text-on-surface-variant">{article.category.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-sans text-sm font-semibold text-on-surface shrink-0">
                        <Eye size={13} className="text-on-surface-variant" />
                        {article.views_count.toLocaleString()}
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* Articles by category */}
          <div className="island-card p-6">
            <h2 className="font-serif text-headline-md mb-5">Articles by Category</h2>
            <div className="space-y-3">
              {isLoading
                ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                : data?.articles_by_category.map(cat => {
                    const max = Math.max(...(data?.articles_by_category.map(c => c.published_articles_count || 0) || [1]));
                    const pct = max > 0 ? ((cat.published_articles_count || 0) / max) * 100 : 0;
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="font-sans text-sm text-on-surface">{cat.name}</span>
                          </div>
                          <span className="font-sans text-sm font-semibold text-on-surface-variant">
                            {cat.published_articles_count || 0}
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Recent users */}
          <div className="island-card p-6 lg:col-span-2">
            <h2 className="font-serif text-headline-md mb-5">Recent Registrations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-surface-container" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-surface-container rounded w-full" />
                        <div className="h-2 bg-surface-container rounded w-2/3" />
                      </div>
                    </div>
                  ))
                : data?.recent_users.map(user => (
                    <div key={user.id} className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-medium text-on-surface truncate">{user.name}</p>
                        <p className="font-sans text-xs text-on-surface-variant truncate">{user.email}</p>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
