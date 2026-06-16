import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { adminService } from '../../services/api';
import { Article } from '../../types';
import { Plus, Edit, Trash2, Eye, Search, Filter, CheckCircle, XCircle, Flame, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminArticlesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', search, status, page],
    queryFn: () => adminService.getArticles({ search, status, page, per_page: 15 }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Article deleted.');
    },
    onError: () => toast.error('Failed to delete article.'),
  });

  const toggleBreaking = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) => adminService.setBreaking(id, val),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-articles'] }),
  });

  const toggleTrending = useMutation({
    mutationFn: ({ id, val }: { id: number; val: boolean }) => adminService.setTrending(id, val),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-articles'] }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminService.publishArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success('Article published.');
    },
  });

  const articles: Article[] = data?.data || [];
  const meta = data?.meta;

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Helmet><title>Articles — Admin Dashboard</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-headline-lg">Articles</h1>
          <Link to="/admin/articles/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> New Article
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-on-surface-variant" />
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 border border-outline-variant/40 rounded-lg bg-surface font-sans text-sm outline-none focus:border-outline text-on-surface"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="island-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant">Article</th>
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Views</th>
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-right font-sans text-label-caps uppercase tracking-wider text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-4" colSpan={6}>
                          <div className="animate-pulse flex gap-3">
                            <div className="w-14 h-10 bg-surface-container rounded shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-surface-container rounded w-3/4" />
                              <div className="h-3 bg-surface-container rounded w-1/2" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  : articles.map(article => (
                      <tr key={article.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {article.featured_image && (
                              <img src={article.featured_image} alt="" className="w-14 h-10 object-cover rounded shrink-0 hidden sm:block" />
                            )}
                            <div className="min-w-0">
                              <p className="font-sans text-sm font-medium text-on-surface line-clamp-1">{article.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {article.is_breaking && (
                                  <span className="font-sans text-xs text-secondary font-semibold">● Breaking</span>
                                )}
                                {article.is_trending && (
                                  <span className="font-sans text-xs text-blue-600 dark:text-blue-400 font-semibold">↑ Trending</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          {article.category && (
                            <span className="font-sans text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: article.category.color }}>
                              {article.category.name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-sans text-xs px-2.5 py-1 rounded-full font-medium ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {article.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1 font-sans text-sm text-on-surface-variant">
                            <Eye size={12} /> {article.views_count.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="font-sans text-xs text-on-surface-variant">
                            {article.created_at && formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {article.status === 'draft' && (
                              <button
                                onClick={() => publishMutation.mutate(article.id)}
                                title="Publish"
                                className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => toggleBreaking.mutate({ id: article.id, val: !article.is_breaking })}
                              title={article.is_breaking ? 'Remove breaking' : 'Set as breaking'}
                              className={`p-1.5 rounded transition-colors ${article.is_breaking ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}
                            >
                              <Flame size={15} />
                            </button>
                            <button
                              onClick={() => toggleTrending.mutate({ id: article.id, val: !article.is_trending })}
                              title={article.is_trending ? 'Remove trending' : 'Set as trending'}
                              className={`p-1.5 rounded transition-colors ${article.is_trending ? 'text-blue-600' : 'text-on-surface-variant hover:text-blue-600'}`}
                            >
                              <TrendingUp size={15} />
                            </button>
                            <Link
                              to={`/article/${article.slug}`}
                              target="_blank"
                              title="Preview"
                              className="p-1.5 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              to={`/admin/articles/edit/${article.id}`}
                              title="Edit"
                              className="p-1.5 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                              <Edit size={15} />
                            </Link>
                            <button
                              onClick={() => handleDelete(article.id, article.title)}
                              title="Delete"
                              className="p-1.5 rounded text-on-surface-variant hover:text-secondary transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
              <span className="font-sans text-xs text-on-surface-variant">
                Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, meta.total)} of {meta.total}
              </span>
              <div className="flex gap-2">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded font-sans text-sm transition-colors ${
                      p === page
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
