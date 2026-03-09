import { useMutation, useQueryClient } from "@tanstack/react-query";
import createClient from "@/utils/supabase/client";
import { toggleLike } from "@/utils/likes";
import { newsInteractionsKeys } from "@/lib/queries/newInterectionQuery";

/**
 * 좋아요 토글 Mutation
 * - Optimistic Update 지원
 * - 성공 시 관련 쿼리 자동 무효화
 */
export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      return await toggleLike(newsId);
    },
    onSuccess: (data, newsId) => {
      // 뉴스 상호작용 쿼리 무효화 (활성 쿼리만 refetch)
      queryClient.invalidateQueries({
        queryKey: newsInteractionsKeys.all,
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("좋아요 토글 실패:", error);
    },
  });
}

/**
 * 북마크 토글 Mutation
 * - Optimistic Update 지원
 * - 성공 시 관련 쿼리 자동 무효화
 */
export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      newsId,
      userId,
      isBookmarked,
    }: {
      newsId: string;
      userId: string;
      isBookmarked: boolean;
    }) => {
      const supabase = createClient();

      if (!isBookmarked) {
        // 북마크 추가
        const { error } = await supabase.from("Bookmark").insert({
          user_id: userId,
          news_id: newsId,
        });
        if (error) throw error;
        return { isBookmarked: true };
      } else {
        // 북마크 제거
        const { error } = await supabase
          .from("Bookmark")
          .delete()
          .eq("user_id", userId)
          .eq("news_id", newsId);
        if (error) throw error;
        return { isBookmarked: false };
      }
    },
    onSuccess: () => {
      // 뉴스 상호작용 쿼리 무효화 (활성 쿼리만 refetch)
      queryClient.invalidateQueries({
        queryKey: newsInteractionsKeys.all,
        refetchType: "active",
      });
    },
    onError: (error) => {
      console.error("북마크 토글 실패:", error);
    },
  });
}
