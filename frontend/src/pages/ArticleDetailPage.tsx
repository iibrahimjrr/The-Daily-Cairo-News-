import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Clock, Eye, Calendar, Bookmark, BookmarkCheck, Share2, Tag, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { articleService, userService } from '../services/api';
import { mockArticles } from '../data/mockArticles';
import ArticleCard from '../components/news/ArticleCard';
import { Skeleton } from '../components/common/Skeleton';
import { useAuthStore } from '../store/authStore';
import { Article } from '../types';
import toast from 'react-hot-toast';
import CommentSection from '../components/news/CommentSection';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [bookmarked, setBookmarked] = useState(false);
  const { isAuthenticated } = useAuthStore();

  /* ── Fetch article ── */
  const { data: apiArticle, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn:  () => articleService.getOne(slug!).then(r => r.data.data),
    enabled:  !!slug,
    retry: 1,
  });

  /* Mock fallback */
  const mockArticle = mockArticles.find(a => a.slug === slug);
  const data: Article | undefined = apiArticle ?? mockArticle;

  /* ── Fetch related ── */
  const { data: relatedApi } = useQuery({
    queryKey: ['related', slug],
    queryFn:  () => articleService.getRelated(slug!).then(r => r.data.data),
    enabled:  !!slug && !!data,
    retry: 1,
  });

  const related: Article[] = relatedApi
    ?? mockArticles.filter(a => a.category?.slug === data?.category?.slug && a.slug !== slug).slice(0, 4);

  /* ── Side effects ── */
  useEffect(() => {
    if (data?.id) {
      articleService.incrementView(data.id).catch(() => {});
      if (isAuthenticated) {
        userService.addToHistory(data.id).catch(() => {});
      }
    }
  }, [data?.id, isAuthenticated]);

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Please login to bookmark articles.'); return; }
    if (!data) return;
    try {
      if (bookmarked) {
        await userService.removeBookmark(data.id);
        setBookmarked(false);
        toast.success('Bookmark removed.');
      } else {
        await userService.addBookmark(data.id);
        setBookmarked(true);
        toast.success('Article saved to bookmarks!');
      }
    } catch { toast.error('Failed to update bookmark.'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: data?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!data) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-24 text-center">
        <h2 className="font-serif text-3xl mb-4">Article not found</h2>
        <p className="font-sans text-on-surface-variant mb-8">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn-primary inline-block px-8">Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{data.meta_title ?? data.title} — The Daily Cairo</title>
        <meta name="description" content={data.meta_description ?? data.excerpt} />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.excerpt} />
        {data.featured_image && <meta property="og:image" content={data.featured_image} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Article ── */}
          <motion.article
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Back link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Back
            </Link>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {data.category && (
                <span
                  className="font-sans text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: data.category.color }}
                >
                  {data.category.name}
                </span>
              )}
              {data.is_breaking && (
                <span className="font-sans text-xs font-bold bg-secondary text-on-secondary px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Breaking
                </span>
              )}
              {data.is_trending && (
                <span className="font-sans text-xs font-semibold bg-primary text-on-primary px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 text-on-surface">
              {data.title}
            </h1>

            {/* Subtitle */}
            {data.subtitle && (
              <p className="font-sans text-lg md:text-xl text-on-surface-variant leading-relaxed mb-6">
                {data.subtitle}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-outline-variant/30">
              {data.author && (
                <div className="flex items-center gap-2.5">
                  <img
                    src={data.author.avatar}
                    alt={data.author.name}
                    className="w-9 h-9 rounded-full object-cover border border-outline-variant/30"
                  />
                  <div>
                    <p className="font-sans text-sm font-semibold text-on-surface leading-none">{data.author.name}</p>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5">Author</p>
                  </div>
                </div>
              )}

              {data.published_at && (
                <div className="flex items-center gap-1.5 font-sans text-xs text-on-surface-variant">
                  <Calendar size={13} />
                  <span>{format(new Date(data.published_at), 'MMMM d, yyyy')}</span>
                  <span className="text-outline-variant">·</span>
                  <span>{formatDistanceToNow(new Date(data.published_at), { addSuffix: true })}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 font-sans text-xs text-on-surface-variant">
                <Clock size={13} /> {data.read_time} min read
              </div>

              <div className="flex items-center gap-1.5 font-sans text-xs text-on-surface-variant">
                <Eye size={13} /> {data.views_count?.toLocaleString()} views
              </div>

              {/* Action buttons */}
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={handleBookmark}
                  title={bookmarked ? 'Remove bookmark' : 'Save article'}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-all"
                >
                  {bookmarked
                    ? <BookmarkCheck size={18} className="text-secondary" />
                    : <Bookmark size={18} />}
                </button>
                <button
                  onClick={handleShare}
                  title="Share article"
                  className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Featured image */}
            {data.featured_image && (
              <div className="w-full rounded-2xl overflow-hidden mb-8 aspect-[16/9] shadow-sm">
                <img
                  src={data.featured_image}
                  alt={data.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Article content */}
            <div
              className="article-content text-on-surface"
              dangerouslySetInnerHTML={{ __html: data.content || '<p>Content not available.</p>' }}
            />

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-outline-variant/30">
                <Tag size={14} className="text-on-surface-variant shrink-0" />
                {data.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="font-sans text-xs px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Comments */}
            <CommentSection articleId={data.id} comments={data.comments ?? []} />
          </motion.article>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4 space-y-6">
            {related.length > 0 && (
              <div className="island-card p-5 sticky top-24">
                <h3 className="font-serif text-xl font-bold mb-5 pb-3 border-b border-outline-variant/20">
                  Related Stories
                </h3>
                <div className="space-y-5">
                  {related.map((article: Article) => (
                    <ArticleCard key={article.id} article={article} variant="horizontal" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
