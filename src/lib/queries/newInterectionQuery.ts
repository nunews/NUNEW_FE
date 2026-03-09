import createClient from "@/utils/supabase/client";

// 쿼리 키 관리
export const newsInteractionsKeys = {
  all: ["newsInteractions"] as const,
  lists: () => [...newsInteractionsKeys.all, "list"] as const,
  list: (newsIds: string[], userId: string | null) =>
    [...newsInteractionsKeys.lists(), { newsIds, userId }] as const,
  details: () => [...newsInteractionsKeys.all, "detail"] as const,
  detail: (newsId: string) =>
    [...newsInteractionsKeys.details(), newsId] as const,
};

// 쿼리 옵션
export const newsInteractionsOptions = {
  list: (newsIds: string[], userId: string | null) => ({
    queryKey: newsInteractionsKeys.list(newsIds, userId),
    queryFn: async () => {
      if (!userId || newsIds.length === 0) {
        return {
          likes: new Set<string>(),
          bookmarks: new Set<string>(),
          likeCounts: {} as Record<string, number>,
        };
      }

      const supabase = createClient();

      // 병렬 조회
      const [likesData, bookmarksData, likeCountsData] = await Promise.all([
        supabase
          .from("Like")
          .select("news_id")
          .eq("user_id", userId)
          .in("news_id", newsIds),

        supabase
          .from("Bookmark")
          .select("news_id")
          .eq("user_id", userId)
          .in("news_id", newsIds),

        supabase.from("Like").select("news_id").in("news_id", newsIds),
      ]);

      const likes = new Set(likesData.data?.map((l) => l.news_id) || []);
      const bookmarks = new Set(
        bookmarksData.data?.map((b) => b.news_id) || []
      );

      const likeCounts: Record<string, number> = {};
      likeCountsData.data?.forEach((item) => {
        likeCounts[item.news_id] = (likeCounts[item.news_id] || 0) + 1;
      });

      return { likes, bookmarks, likeCounts };
    },
    enabled: !!userId && newsIds.length > 0,
    // 3분간 fresh 상태 유지 (mutation 발생 시 자동으로 invalidate됨)
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
    // Window focus 시 refetch 비활성화 (mutation으로 관리)
    refetchOnWindowFocus: false,
    // Interval refetch 비활성화 (mutation으로 관리)
    refetchInterval: false,
  }),
};

// 타입 추출
export type NewsInteractions = Awaited<
  ReturnType<ReturnType<typeof newsInteractionsOptions.list>["queryFn"]>
>;
