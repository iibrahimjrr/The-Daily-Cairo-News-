import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { searchService } from '../services/api';
import { mockArticles } from '../data/mockArticles';
import ArticleCard from '../components/news/ArticleCard';
import { ArticleCardSkeleton } from '../components/common/Skeleton';
import { Article } from '../types';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { setLocalQuery(query); setPage(1); }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, page],
    queryFn:  () => searchService.search(query, { page, per_page: 12 }).then(r => r.data),
    enabled:  query.length >= 2,
    retry: 1,
  });

  /* Mock fallback: filter locally */
  const fallbackArticles = query.length >= 2
    ? mockArticles.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const articles: Article[] = data?.data ?? (isLoading ? [] : fallbackArticles);
  const meta = data?.meta;
  const total = meta?.total ?? fallbackArticles.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>{query ? `"${query}" — Search` : 'Search'} — The Daily Cairo</title>
      </Helmet>

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-10">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-2xl">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              type="text"
              placeholder="Search stories, topics, categories..."
              className="w-full pl-11 pr-10 py-3.5 border border-outline-variant/40 rounded-full bg-transparent font-sans text-sm text-on-surface outline-none focus:border-outline transition-colors"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary px-6 shrink-0">Search</button>
        </form>

        {/* Results header */}
        <AnimatePresence mode="wait">
          {query && (
            <motion.div
              key={query}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="font-serif text-2xl text-on-surface">
                {isLoading
                  ? 'Searching...'
                  : `${total.toLocaleString()} result${total !== 1 ? 's' : ''} for `}
                {!isLoading && (
                  <span className="text-secondary">"{query}"</span>
                )}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        )}

        {/* No results */}
        {!isLoading && query && articles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Search size={52} className="mx-auto text-on-surface-variant/40 mb-5" />
            <h2 className="font-serif text-2xl mb-2">No results found</h2>
            <p className="font-sans text-sm text-on-surface-variant">
              Try different keywords or browse our{' '}
              <a href="/categories" className="text-secondary hover:underline">categories</a>.
            </p>
          </motion.div>
        )}

        {/* Empty state (no query yet) */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Search size={52} className="mx-auto text-on-surface-variant/30 mb-5" />
            <h2 className="font-serif text-2xl mb-2 text-on-surface-variant">What are you looking for?</h2>
            <p className="font-sans text-sm text-on-surface-variant">
              Enter a keyword above to search all articles.
            </p>
          </motion.div>
        )}

        {/* Results grid */}
        {!isLoading && articles.length > 0 && (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </motion.div>

            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-sans text-sm text-on-surface-variant">
                  Page {page} of {meta.last_page}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                  disabled={page === meta.last_page}
                  className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
