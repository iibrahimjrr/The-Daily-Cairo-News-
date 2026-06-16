import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { userService } from '../../services/api';
import ArticleCard from '../../components/news/ArticleCard';
import { ArticleCardSkeleton } from '../../components/common/Skeleton';
import { Article } from '../../types';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => userService.getBookmarks().then(r => r.data),
  });
  const articles: Article[] = data?.data || [];

  return (
    <>
      <Helmet><title>Bookmarks — The Daily Cairo</title></Helmet>
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark size={22} className="text-secondary" />
          <h1 className="font-serif text-headline-lg">Saved Articles</h1>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark size={40} className="mx-auto text-on-surface-variant mb-4" />
            <p className="font-serif text-headline-md text-on-surface-variant">No saved articles yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => <ArticleCard key={article.id} article={article} />)}
          </div>
        )}
      </div>
    </>
  );
}
