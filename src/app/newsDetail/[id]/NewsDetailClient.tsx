"use client";

import Header from "@/components/layout/header";
import AudienceAnalyticsChart from "@/components/articleDetail/AudienceAnalyticsChart";
import RelatedNewsSection from "@/components/articleDetail/RelatedNewsSection";
import RelatedPostsSection from "@/components/articleDetail/RelatedPostSection";
import NewsArticleContent from "@/components/articleDetail/NewsArticleContent";
import createClient from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface NewsData {
  news_id: string;
  category_id: string;
  title: string;
  content: string;
  source: string;
  published_at: string;
  url: string;
  view_count: number;
  like_count: number;
  image_url: string;
}

interface NewsDetailClientProps {
  newsData: NewsData;
}

export default function NewsDetailClient({ newsData }: NewsDetailClientProps) {
  const supabase = createClient();
  const hasIncrementedView = useRef(false);
  const queryClient = useQueryClient();

  const { mutate: incrementNewsView } = useMutation({
    mutationFn: async (newsId: string) => {
      await supabase.rpc("increment_news_view", {
        p_news_id: newsId,
      });
    },
    onMutate: async (newsId) => {
      await queryClient.cancelQueries({ queryKey: ["news-detail", newsId] });

      const previousData = queryClient.getQueryData(["news-detail", newsId]);
      queryClient.setQueryData(["news-detail", newsId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          view_count: (old.view_count || 0) + 1,
        };
      });

      return { previousData };
    },
    onError: (err, newsId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["news-detail", newsId], context.previousData);
      }
    },
    onSettled: (data, error, newsId) => {
      queryClient.invalidateQueries({ queryKey: ["news-detail", newsId] });
    },
  });

  useEffect(() => {
    if (!newsData || hasIncrementedView.current) return;
    incrementNewsView(newsData.news_id);
    hasIncrementedView.current = true;
  }, [newsData, incrementNewsView]);

  return (
    <div className="min-h-screen">
      <Header logo={false} />

      {/* 뉴스 본문 */}
      <NewsArticleContent newsData={newsData} />

      {/* 조회수/좋아요 차트 */}
      <div className="px-5">
        <div className="py-3 mt-9">
          <AudienceAnalyticsChart newsId={newsData.news_id} />
        </div>
        <div className="border-b border-[var(--color-gray-20)] mt-9 dark:border-[var(--color-gray-100)]" />
        {/* 다른 유저의 생각 */}
        <RelatedPostsSection categoryLabel={newsData.category_id ?? null} />
        <div className="border-b border-[var(--color-gray-20)] mt-9 dark:border-[var(--color-gray-100)]" />
        {/* 관심 가질만한 다른 뉴스 섹션 */}
        <RelatedNewsSection
          categoryLabel={newsData.category_id ?? null}
          currentNewsId={newsData.news_id ?? null}
        />
      </div>
    </div>
  );
}
