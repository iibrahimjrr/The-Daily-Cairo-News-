import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryService } from '../services/api';
import { getByCategory, mockCategories } from '../data/mockArticles';
import ArticleCard from '../components/news/ArticleCard';
import { ArticleCardSkeleton } from '../components/common/Skeleton';
import { Article, Category } from '../types';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: categoryData } = useQuery({
    queryKey: ['category', slug],
    queryFn:  () => categoryService.getOne(slug!).then(r => r.data.data),
    enabled:  !!slug,
    retry: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['category-articles', slug, page],
    queryFn:  () => categoryService.getArticles(slug!, { page, per_page: 12 }).then(r => r.data),
    enabled:  !!slug,
    retry: 1,
  });

  /* Fallback */
  const fallbackCat = mockCategories.find(c => c.slug === slug);
  const category: Category | undefined = categoryData ?? fallbackCat;
  const articles: Article[] = data?.data ?? (page === 1 ? getByCategory(slug ?? '') : []);
  const meta = data?.meta;

  return (
    <>
      <Helmet>
        <title>{category?.name ?? 'Category'} — The Daily Cairo</title>
        <meta name="description" content={`Latest ${category?.name} news from The Daily Cairo.`} />
      </Helmet>

      {/* Category header */}
      {category && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-14 px-5 md:px-12 text-white mb-8"
          style={{ backgroundColor: category.color }}
        >
          <div className="max-w-[1440px] mx-auto">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-white/60 mb-2 block">Section</span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">{category.name}</h1>
            {category.description && (
              <p className="font-sans text-base text-white/75 max-w-xl">{category.description}</p>
            )}
          </div>
        </motion.div>
      )}

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 pb-14">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl text-on-surface-variant">No articles found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
            </div>

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
