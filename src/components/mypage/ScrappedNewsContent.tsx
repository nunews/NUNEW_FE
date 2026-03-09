"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import createClient from "@/utils/supabase/client";
import DefaultCard from "../ui/DefaultCard";
import CategoryFilter from "./CategoryFilter";
import { timeAgo } from "@/utils/date";
import { categoryIdMap } from "@/lib/categoryUUID";
import DefaultCardSkel from "./skeleton/DefaultCardSkel";
import { useAuthStore } from "@/stores/authStore";
import { useToggleBookmarkMutation } from "@/hooks/useNewsInteractionMutations";
import { toast } from "sonner";

export default function ScrappedNewsContent({
  onScrapCountChange,
}: ScrappedNewsContentProps) {
  const [scrappedNews, setScrappedNews] = useState<UserScrapItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const userId = useAuthStore((state) => state.userId);

  const fetchScrappedNews = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("Bookmark")
      .select(
        `
      created_at,
      News:news_id (
        *,
        Category:category_id (title, category_id)
      )
    `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching scrapped news:", error);
      setScrappedNews([]);
      setLoading(false);
      return;
    }

    const formattedData: UserScrapItem[] = (data || [])
      .map((item: SupabaseUserScrapResponse) => {
        const news = Array.isArray(item.News) ? item.News[0] : item.News;
        return news ? { created_at: item.created_at, News: news } : null;
      })
      .filter((item): item is UserScrapItem => item !== null);

    setScrappedNews(formattedData);
    setLoading(false);
  }, [userId, supabase]);

  // 카테고리 전환 시
  const filteredScrappedNews = useMemo(() => {
    if (activeCategory === "전체") return scrappedNews;

    const selectedCategoryId =
      categoryIdMap[activeCategory as keyof typeof categoryIdMap];

    return scrappedNews.filter(
      (item) => item.News.Category?.category_id === selectedCategoryId
    );
  }, [scrappedNews, activeCategory]);

  // 스크랩 수 전달
  useEffect(() => {
    onScrapCountChange?.(scrappedNews.length);
  }, [scrappedNews, onScrapCountChange]);

  // 스크랩 뉴스 가져오기
  useEffect(() => {
    fetchScrappedNews();
  }, [fetchScrappedNews]);

  const toggleBookmarkMutation = useToggleBookmarkMutation();

  const handleBookmark = (newsId: string) => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    toggleBookmarkMutation.mutate(
      {
        newsId,
        userId,
        isBookmarked: true,
      },
      {
        onSuccess: () => {
          toast.success("스크랩을 취소했어요.");

          setScrappedNews((prev) =>
            prev.filter((item) => item.News.news_id !== newsId)
          );
        },
        onError: (err) => {
          console.error("스크랩 토글 실패:", err);
          toast.error("스크랩 처리에 실패했습니다.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col px-5 py-6 mb-18">
      <div className="mr-[-20px]">
        <CategoryFilter
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      <div>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <DefaultCardSkel key={i} />)
        ) : filteredScrappedNews.length > 0 ? (
          filteredScrappedNews.map((item) => (
            <DefaultCard
              key={item.News.news_id}
              newsId={item.News.news_id}
              userId={userId}
              title={item.News.title}
              category={item.News.Category?.title || ""}
              timeAgo={timeAgo(item.News.published_at)}
              likes={item.News.like_count}
              views={item.News.view_count}
              image={item.News.image_url}
              isBookmarked={true}
              handleBookmark={() => handleBookmark(item.News.news_id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 mt-4">
            불러올 뉴스가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
