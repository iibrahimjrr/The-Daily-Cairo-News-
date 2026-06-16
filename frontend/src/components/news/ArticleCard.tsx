import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { Article } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'hero' | 'compact' | 'horizontal';
  className?: string;
}

export default function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to bookmark articles.');
      return;
    }
    try {
      if (bookmarked) {
        await userService.removeBookmark(article.id);
        setBookmarked(false);
        toast.success('Bookmark removed.');
      } else {
        await userService.addBookmark(article.id);
        setBookmarked(true);
        toast.success('Article bookmarked!');
      }
    } catch {
      toast.error('Failed to update bookmark.');
    }
  };

  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : '';

  if (variant === 'hero') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx('island-card overflow-hidden group', className)}
      >
        <Link to={`/article/${article.slug}`}>
          {article.featured_image && (
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {article.category && (
                  <span
                    className="category-badge text-white mb-2 inline-block"
                    style={{ backgroundColor: article.category.color }}
                  >
                    {article.category.name}
                  </span>
                )}
                <h2 className="font-serif text-display-lg-mobile text-white leading-tight mb-2">
                  {article.title}
                </h2>
              </div>
            </div>
          )}
          <div className="p-5">
            {article.subtitle && (
              <p className="font-sans text-body-md text-on-surface-variant mb-4">{article.subtitle}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-on-surface-variant">
                <span className="font-sans text-metadata">{article.author?.name}</span>
                <span className="font-sans text-metadata">{timeAgo}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-sans text-metadata text-on-surface-variant">
                  <Clock size={12} /> {article.read_time}m
                </span>
                <button onClick={handleBookmark} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  {bookmarked ? <BookmarkCheck size={16} className="text-secondary" /> : <Bookmark size={16} />}
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={clsx('flex gap-4 group', className)}
      >
        <Link to={`/article/${article.slug}`} className="flex gap-4 flex-1">
          {article.featured_image && (
            <div className="w-24 h-24 md:w-32 md:h-24 shrink-0 rounded-lg overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {article.category && (
              <span
                className="category-badge text-white text-xs mb-1.5 inline-block"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            <h3 className="font-serif text-headline-md leading-tight mb-1 text-on-surface group-hover:text-secondary transition-colors line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="font-sans text-xs">{timeAgo}</span>
              <span className="flex items-center gap-1 font-sans text-xs">
                <Eye size={11} /> {article.views_count.toLocaleString()}
              </span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className={clsx('group', className)}>
        <Link to={`/article/${article.slug}`}>
          <h3 className="font-serif text-base leading-snug mb-1 text-on-surface group-hover:text-secondary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="font-sans text-xs text-on-surface-variant">{timeAgo}</p>
        </Link>
      </article>
    );
  }

  // Default card
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('island-card overflow-hidden group flex flex-col', className)}
    >
      <Link to={`/article/${article.slug}`} className="flex flex-col flex-1">
        {article.featured_image && (
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {article.is_breaking && (
              <span className="absolute top-3 left-3 breaking-badge">Breaking</span>
            )}
            {article.is_trending && (
              <span className="absolute top-3 right-3 bg-primary text-on-primary font-sans text-label-caps px-2 py-0.5 rounded text-xs font-semibold">
                Trending
              </span>
            )}
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            {article.category && (
              <span
                className="category-badge text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            )}
            <span className="font-sans text-metadata text-on-surface-variant ml-auto">{timeAgo}</span>
          </div>
          <h2 className="font-serif text-headline-md leading-tight mb-2 text-on-surface group-hover:text-secondary transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="font-sans text-metadata text-on-surface-variant mb-4 flex-1 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/20">
            <div className="flex items-center gap-2">
              {article.author && (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="font-sans text-metadata text-on-surface-variant">{article.author?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-sans text-metadata text-on-surface-variant">
                <Clock size={12} /> {article.read_time}m
              </span>
              <button onClick={handleBookmark} className="text-on-surface-variant hover:text-secondary transition-colors">
                {bookmarked ? <BookmarkCheck size={15} className="text-secondary" /> : <Bookmark size={15} />}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
