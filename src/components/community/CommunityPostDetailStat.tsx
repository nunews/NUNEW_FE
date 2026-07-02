"use client";
import {
  fetchComment,
  fetchLike,
  isLikedByUser,
  postLike,
  postUnlike,
} from "@/app/api/community";
import { usePostComments } from "@/hooks/usePostComments";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { IoChatboxOutline, IoEyeOutline } from "react-icons/io5";
import { toast } from "sonner";

export default function CommunityPostDetailStat({
  postId,
  view_count,
}: {
  postId: string;
  view_count: number;
}) {
  const [likeCount, setLikeCount] = useState(0);
  const userId = useAuthStore((state) => state.userId);
  const { comments } = usePostComments(postId);

  const { data: likeData } = useQuery<number>({
    queryKey: ["likeData", postId],
    queryFn: () => {
      return fetchLike(postId);
    },
  });

  useEffect(() => {
    if (likeData !== undefined) {
      setLikeCount(likeData);
    }
  }, [likeData]);

  //사용자 좋아요 여부
  const { data: isLiked = false } = useQuery({
    queryKey: ["isLiked", userId, postId],
    queryFn: async () => {
      if (!userId) return false;
      return isLikedByUser(postId, userId);
    },
  });
  const [like, setLike] = useState(isLiked ?? false); //사용자 좋아요 여부

  useEffect(() => {
    (async () => {
      if (userId) {
        const liked = await isLikedByUser(postId, userId);
        setLike(liked);
      }
    })();
  }, [postId, userId]);

  const queryClient = useQueryClient();
  //좋아요 업데이트
  const { mutate: likeUpdate } = useMutation({
    mutationFn: (liked: boolean) => {
      if (!postId || !userId) {
        return Promise.resolve(null);
      }
      return liked ? postLike(postId, userId) : postUnlike(postId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", postId, userId] });
    },
    onError: (err) => {
      console.error("좋아요 업로드 실패:", err);
      setLike((prev) => !prev);
      setLikeCount((prev) => prev + (like ? 1 : -1));
    },
  });
  const likeHandler = () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setLike((prev) => !prev);
    setLikeCount((prev) => prev + (like ? -1 : 1));
    likeUpdate(!like);
  };
  return (
    <div className="mt-6 flex items-center text-[#b7b7b7] dark:text-[var(--color-gray-70)]">
      {/* 좋아요 */}
      {like ? (
        <AiFillLike
          onClick={likeHandler}
          className="w-5 h-5 cursor-pointer text-[var(--color-black)] dark:text-[var(--color-white)]"
        />
      ) : (
        <AiOutlineLike
          onClick={likeHandler}
          className="w-5 h-5 cursor-pointer hover:text-[var(--color-black)] dark:hover:text-[var(--color-white)] duration-300"
        />
      )}
      <p className="ml-[3px] text-base">{likeCount}</p>

      {/* 댓글 */}
      <IoChatboxOutline className="ml-[11px] w-5 h-5" />
      <p className="ml-[3px] text-base">{comments.length}</p>

      {/* 조회수 */}
      <IoEyeOutline className="ml-[11px] w-5 h-5" />
      <p className="ml-[3px] text-base">{view_count}</p>
    </div>
  );
}
