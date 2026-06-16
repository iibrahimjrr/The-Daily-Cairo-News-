import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Flame, ChevronRight } from 'lucide-react';
import { articleService, categoryService } from '../services/api';
import {
  getFeatured, getBreaking, getTrending, getLatest, mockCategories,
} from '../data/mockArticles';
import ArticleCard from '../components/news/ArticleCard';
import { ArticleCardSkeleton, HeroSkeleton, SidebarArticleSkeleton } from '../components/common/Skeleton';
import { Article, Category } from '../types';

export default function HomePage() {
  /* ── Featured ── */
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured'],
    queryFn:  () => articleService.getFeatured().then(r => r.data.data),
    retry: 1,
  });

  /* ── Latest articles ── */
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['articles', 'home'],
    queryFn:  () => articleService.getAll({ per_page: 9 }).then(r => r.data),
    retry: 1,
  });

  /* ── Trending ── */
  const { data: trendingData } = useQuery({
    queryKey: ['trending'],
    queryFn:  () => articleService.getTrending().then(r => r.data.data),
    retry: 1,
  });

  /* ── Categories ── */
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryService.getAll().then(r => r.data.data),
    retry: 1,
  });

  /* ── Fallback to mock data when API is unavailable ── */
  const featured:   Article[]  = featuredData   ?? getFeatured();
  const articles:   Article[]  = articlesData?.data ?? getLatest(9);
  const trending:   Article[]  = trendingData   ?? getTrending();
  const categories: Category[] = categoriesData ?? mockCategories;

  return (
    <>
      <Helmet>
        <title>The Daily Cairo — Egypt's Premier News Platform</title>
        <meta name="description" content="Breaking news, in-depth analysis, and global perspectives from The Daily Cairo." />
      </Helmet>

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-8">

        {/* ── Category pills ── */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 mb-8">
          <Link
            to="/categories"
            className="shrink-0 font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-on-surface transition-all"
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="shrink-0 font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-all"
              style={{ borderColor: cat.color, color: cat.color }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = cat.color;
                el.style.color = '#fff';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.backgroundColor = '';
                el.style.color = cat.color;
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Main Content ── */}
          <div className="lg:col-span-8">

            {/* Hero */}
            <section className="mb-10">
              {featuredLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HeroSkeleton />
                  <div className="space-y-6">
                    <ArticleCardSkeleton />
                    <ArticleCardSkeleton />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featured[0] && (
                    <ArticleCard article={featured[0]} variant="hero" />
                  )}
                  <div className="space-y-6">
                    {featured.slice(1, 3).map((article: Article) => (
                      <ArticleCard key={article.id} article={article} variant="default" />
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-outline-variant/30" />
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                Latest Stories
              </span>
              <div className="h-px flex-1 bg-outline-variant/30" />
            </div>

            {/* Latest grid */}
            <section>
              {articlesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {articles.map((article: Article, i: number) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div className="text-center mt-10">
                <Link to="/categories" className="btn-ghost inline-flex items-center gap-2">
                  Explore All Stories <ChevronRight size={16} />
                </Link>
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Trending */}
            <div className="island-card p-5">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-outline-variant/20">
                <TrendingUp size={16} className="text-secondary" />
                <h3 className="font-serif text-xl font-bold">Trending Now</h3>
              </div>
              <div className="space-y-5">
                {trending.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => <SidebarArticleSkeleton key={i} />)
                  : trending.map((article: Article, i: number) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <ArticleCard article={article} variant="horizontal" />
                      </motion.div>
                    ))}
              </div>
            </div>

            {/* Topics */}
            <div className="island-card p-5">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-outline-variant/20">
                <Flame size={16} className="text-secondary" />
                <h3 className="font-serif text-xl font-bold">Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="font-sans text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                    style={{ borderColor: cat.color, color: cat.color }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = cat.color;
                      el.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.backgroundColor = '';
                      el.style.color = cat.color;
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-primary dark:bg-[#1c1b1b] text-on-primary rounded-xl p-6">
              <h3 className="font-serif text-xl font-bold mb-2">Daily Digest</h3>
              <p className="font-sans text-sm text-on-primary/70 mb-5">
                Get the top stories delivered to your inbox every morning.
              </p>
              <form className="space-y-3" onSubmit={e => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-on-primary/10 border border-on-primary/20 rounded-lg px-4 py-2.5 font-sans text-sm text-on-primary placeholder:text-on-primary/40 outline-none focus:border-on-primary/40 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-on-primary text-primary font-sans text-sm font-semibold rounded-full py-2.5 hover:opacity-90 transition-opacity"
                >
                  Subscribe Free
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
