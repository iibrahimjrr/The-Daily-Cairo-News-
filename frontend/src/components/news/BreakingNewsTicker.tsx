import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { articleService } from '../../services/api';
import { getBreaking } from '../../data/mockArticles';
import { Article } from '../../types';

export default function BreakingNewsTicker() {
  const { data } = useQuery({
    queryKey: ['breaking-news'],
    queryFn:  () => articleService.getBreaking().then(r => r.data.data),
    staleTime: 60_000,
    retry: 1,
  });

  /* Fallback to mock breaking news */
  const articles: Article[] = data ?? getBreaking();

  if (!articles || articles.length === 0) return null;

  /* Repeat twice so ticker loops seamlessly */
  const items = [...articles, ...articles];
  const speed  = Math.max(25, articles.length * 8);

  return (
    <div className="w-full bg-secondary text-on-secondary py-2 overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 flex items-center gap-4">
        {/* Badge */}
        <span className="font-sans text-xs font-bold bg-on-secondary text-secondary px-2.5 py-0.5 rounded uppercase tracking-wider shrink-0">
          Breaking
        </span>

        {/* Ticker */}
        <div className="overflow-hidden flex-1">
          <div
            className="whitespace-nowrap inline-block font-sans text-sm animate-ticker"
            style={{ animationDuration: `${speed}s` }}
          >
            {items.map((article: Article, i: number) => (
              <span key={`${article.id}-${i}`} className="mr-16">
                <Link
                  to={`/article/${article.slug}`}
                  className="hover:underline decoration-on-secondary/50 transition-all"
                >
                  {article.title}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
