import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { userService } from '../../services/api';
import ArticleCard from '../../components/news/ArticleCard';
import { Article } from '../../types';
import { History, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => userService.getHistory().then(r => r.data),
  });
  const articles: Article[] = data?.data || [];

  const clearMutation = useMutation({
    mutationFn: () => userService.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      toast.success('Reading history cleared.');
    },
  });

  return (
    <>
      <Helmet><title>Reading History — The Daily Cairo</title></Helmet>
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History size={22} className="text-secondary" />
            <h1 className="font-serif text-headline-lg">Reading History</h1>
          </div>
          {articles.length > 0 && (
            <button
              onClick={() => clearMutation.mutate()}
              className="flex items-center gap-2 font-sans text-sm text-secondary hover:opacity-80 transition-opacity"
            >
              <Trash2 size={15} /> Clear All
            </button>
          )}
        </div>
        {isLoading ? (
          <p className="font-sans text-on-surface-variant">Loading...</p>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <History size={40} className="mx-auto text-on-surface-variant mb-4" />
            <p className="font-serif text-headline-md text-on-surface-variant">No reading history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
