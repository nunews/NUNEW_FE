"use client";
import Header from "@/components/layout/header";
import AudienceAnalyticsChart from "@/components/articleDetail/AudienceAnalyticsChart";
import { useParams } from "next/navigation";
<<<<<<< feat/seo-layout
import { useEffect, useState, useMemo } from "react";
import { useTyping } from "@/hooks/useTyping";
import { getLikesStatus } from "@/utils/likes";
import { useToggleLikeMutation } from "@/hooks/useNewsInteractionMutations";
=======
>>>>>>> dev
import RelatedNewsSection from "@/components/articleDetail/RelatedNewsSection";
import RelatedPostsSection from "@/components/articleDetail/RelatedPostSection";
import { useNewsDetail } from "@/hooks/useNewsDetail";
import NewsDetailSkeleton from "@/components/articleDetail/skeleton/NewsDetailSkeleton";
<<<<<<< feat/seo-layout
import createClient from "@/utils/supabase/client";
import { useAuthStore } from "@/stores/authStore";
=======
import NewsArticleContent from "@/components/articleDetail/NewsArticleContent";
import createClient from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
>>>>>>> dev

export default function NewsDetailPage() {
  const params = useParams();
  const newsId = params.id;

<<<<<<< feat/seo-layout
  const [showSummary, setShowSummary] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { typedRef, runTyped } = useTyping();
  const likeMutation = useToggleLikeMutation();
  const supabase = useMemo(() => createClient(), []);
  const userId = useAuthStore((state) => state.userId);
=======
  const { data: newsData, isLoading } = useNewsDetail(newsId as string);
>>>>>>> dev

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
<<<<<<< feat/seo-layout
    } else {
      reset();
    }
  }, [generateSummary, reset, runTyped, showSummary]);

  // 페이지 로드 시 조회수 증가 및 조회 로그 기록
  useEffect(() => {
    const incrementView = async () => {
      if (!newsId || !userId) return;
      try {
        await supabase.rpc("increment_news_view", {
          p_news_id: newsId as string,
          p_user_id: userId,
        });
      } catch (error) {
        console.error("조회수 증가 실패:", error);
      }
    };

    incrementView();
  }, [newsId, userId, supabase]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!newsId) return;
      try {
        const [status] = await Promise.all([getLikesStatus(newsId as string)]);

        setIsLiked(status);
      } catch (e) {
        console.error("뉴스 좋아요 정보 로딩 실패:", e);
      }
    };

    fetchLikes();
  }, [newsId]);

  const handleSummary = () => {
    setShowSummary(true);
  };

  const handleLikeClick = async () => {
    if (!newsId) return;

    // Optimistic
    const previousIsLiked = isLiked;
    setIsLiked(!isLiked);

    try {
      const res = await likeMutation.mutateAsync(newsId as string);
      setIsLiked(res.isLiked);
    } catch (e) {
      // 실패 시 롤백
      setIsLiked(previousIsLiked);
      toast.error("로그인이 필요합니다.");
      console.error("좋아요 토글 실패:", e);
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const newsTitle = "뉴스 제목";
=======
>>>>>>> dev

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

  if (isLoading) {
    return <NewsDetailSkeleton />;
  }

  if (!newsData) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header logo={false} />

      {/* 뉴스 본문 */}
      <NewsArticleContent newsData={newsData} />

      {/* 조회수/좋아요 차트  */}
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
