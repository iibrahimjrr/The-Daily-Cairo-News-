import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { categoryService } from '../services/api';
import { mockCategories, getByCategory } from '../data/mockArticles';
import { Category } from '../types';

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoryService.getAll().then(r => r.data.data),
    retry: 1,
  });

  const categories: Category[] = data ?? mockCategories;

  return (
    <>
      <Helmet>
        <title>All Topics — The Daily Cairo</title>
        <meta name="description" content="Browse all news categories on The Daily Cairo." />
      </Helmet>

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-14">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Explore Topics</h1>
        <p className="font-sans text-base text-on-surface-variant mb-12 max-w-xl">
          Browse all news categories and find the stories that matter to you.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const count = (cat as Category & { published_articles_count?: number }).published_articles_count
                ?? getByCategory(cat.slug).length;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className="group relative block rounded-xl p-8 h-44 overflow-hidden text-white transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
                    style={{ backgroundColor: cat.color }}
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/10 to-black/40" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-white mb-1 group-hover:underline decoration-white/40">
                          {cat.name}
                        </h2>
                        {cat.description && (
                          <p className="font-sans text-sm text-white/70 line-clamp-2">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-white/60">
                        <FileText size={13} />
                        <span className="font-sans text-xs">{count} article{count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
