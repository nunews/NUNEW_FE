"use client";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import Input from "../ui/Input";
import Comment from "./Comment";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePostComments } from "@/hooks/usePostComments";

export default function CommunityPostDetailComments({
  postId,
}: {
  postId: string;
}) {
  const [comment, setComment] = useState(""); //추가한 댓글
  const userId = useAuthStore((state) => state.userId);
  const { comments, addComment, editComment, removeComment } =
    usePostComments(postId);
  const isDisabled = !comment.trim() || !userId;

  // 댓글 달기
  const commentHandler = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    if (!userId) {
      console.error("로그인이 필요합니다.");
      return;
    }
    addComment(trimmed);
    setComment("");
  };
  return (
    <>
      {/* 댓글 입력 */}
      <div className="mt-6">
        <Input
          rightSlot={
            <PiPaperPlaneTiltBold
              onClick={!isDisabled ? commentHandler : undefined}
              className={`w-5 h-5 transition-colors
    ${
      isDisabled
        ? "text-[var(--color-gray-40)] cursor-not-allowed"
        : "text-[var(--color-gray-80)] dark:text-[var(--color-white)] cursor-pointer"
    }
  `}
            />
          }
          placeholder="댓글을 입력해주세요"
          className="rounded-[50px] w-full h-[50px] text-[var(--color-black)] dark:text-[var(--color-white)] text-base"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              if (isDisabled) return;
              e.preventDefault();
              commentHandler();
            }
          }}
        />
      </div>

      {/* 댓글 */}
      {[...comments]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .map((comment, i) => (
          <div key={comment.comment_id ?? i} className="relative">
            <Comment
              commentUserId={comment.user_id}
              comment={comment.content}
              created_at={comment.created_at}
              onDelete={() => removeComment(comment.comment_id)}
              onUpdate={(newContent) =>
                editComment({
                  commentId: comment.comment_id,
                  newComment: newContent,
                })
              }
            />
          </div>
        ))}
    </>
  );
}
