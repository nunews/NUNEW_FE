"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPostById, postView } from "@/app/api/community";
import { useEffect, useRef } from "react";

import CommunityPostDetailSkel from "./Skeleton/CommunityPostDetailSkel";
import CommunityPostDetailContent from "./CommunityPostDetailContent";
import CommunityPostDetailStat from "./CommunityPostDetailStat";
import CommunityPostDetailComments from "./CommunityPostDetailComments";

export default function CommunityPostDetail() {
  const { postId } = useParams<{ postId?: string }>();
  const hasIncrementedView = useRef(false);
  const queryClient = useQueryClient();

  const { data: postDetailData, isLoading: isPostDetailLoading } =
    useQuery<Post>({
      queryKey: ["postDetail1", postId],
      queryFn: async () => {
        const post = await fetchPostById(postId as string);
        if (!post) {
          console.error("게시글 정보가 없습니다");
          return;
        }
        return post;
      },
      enabled: !!postId,
      staleTime: 0,
    });

  // 조회수 증가 mutation
  const { mutate: incrementViewCount } = useMutation({
    mutationFn: (viewCount: number) => postView(postId as string, viewCount),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["postDetail1", postId] });

      const previousData = queryClient.getQueryData(["postDetail1", postId]);

      queryClient.setQueryData(
        ["postDetail1", postId],
        (old: Post | undefined) => {
          if (!old) return old;
          return {
            ...old,
            view_count: (old.view_count || 0) + 1,
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      console.error("조회수 업데이트 실패:", err);
      if (context?.previousData) {
        queryClient.setQueryData(["postDetail1", postId], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail1", postId] });
    },
  });

  useEffect(() => {
    hasIncrementedView.current = false;
  }, [postId]);

  // 페이지 로드 시 조회수 증가
  useEffect(() => {
    if (!postId || !postDetailData || hasIncrementedView.current) return;

    const currentViewCount = postDetailData.view_count ?? 0;
    incrementViewCount(currentViewCount + 1);
    hasIncrementedView.current = true;
  }, [postId, postDetailData, incrementViewCount]);

  const writerId = postDetailData?.user_id ?? null;
  return (
    <>
      <div className="pt-[62px] min-h-screen w-full px-5 pb-[90px] relative">
        {isPostDetailLoading && <CommunityPostDetailSkel />}
        {postDetailData && (
          <>
            <CommunityPostDetailContent
              writerId={writerId!}
              postId={postId!}
              categoryId={postDetailData.category_id}
              title={postDetailData.title}
              content_image={postDetailData.content_image}
              contents={postDetailData.contents}
            />

            {/*  좋아요, 조회수 */}
            <CommunityPostDetailStat
              postId={postId!}
              view_count={postDetailData!.view_count}
            />

            {/* 댓글 */}
            <CommunityPostDetailComments postId={postId!} />
          </>
        )}
      </div>
    </>
  );
}
