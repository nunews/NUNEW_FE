"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { TextButton } from "../ui/TextButton";
import { IoBookmarkOutline, IoBookmark, IoEyeOutline } from "react-icons/io5";
import { IconButton as BookmarkButton } from "../ui/IconButton";
import { AiOutlineLike } from "react-icons/ai";
import { allCategoryMap } from "@/lib/categoryUUID";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useToggleLikeMutation } from "@/hooks/useNewsInteractionMutations";
import { useBookmarkToggle } from "@/hooks/useBookmarkToggle";

interface NewsSectionProps {
  newsId: string | undefined;
  className: string;
  data: SupabaseNewsData;
  likes?: number;
  views?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  handleSummary: () => void;
  handleDetail: () => void;
  isFirst: boolean;
}

export default function NewsSection({
  newsId,
  className,
  data,
  likes,
  views,
  isLiked: initialIsLiked = false,
  isBookmarked: initialIsBookmarked = false,
  handleSummary,
  handleDetail,
  isFirst,
}: NewsSectionProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likedCnt, setLikedCnt] = useState(likes ?? 0);
  const [viewCnt, setViewCnt] = useState(views ?? data.view_count ?? 0);
  const isBookmarked = initialIsBookmarked;
  const userId = useAuthStore((state) => state.userId);

  // Mutation 훅
  const likeMutation = useToggleLikeMutation();

  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  useEffect(() => {
    setLikedCnt(likes ?? 0);
  }, [likes]);

  useEffect(() => {
    setViewCnt(views ?? data.view_count ?? 0);
  }, [views, data.view_count]);

  // 북마크 토글
  const { toggle } = useBookmarkToggle({
    newsId,
    userId,
    isBookmarked,
  });
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  // 좋아요 토글
  const handleLike = async () => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!newsId) return;

    // Optimistic Update - 즉시 UI 반영
    const previousIsLiked = isLiked;
    const previousLikedCnt = likedCnt;
    setIsLiked(!isLiked);
    setLikedCnt((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const res = await likeMutation.mutateAsync(newsId);
      setIsLiked(res.isLiked);
      setLikedCnt(res.likedCount);
    } catch (err) {
      // 실패 시 롤백
      setIsLiked(previousIsLiked);
      setLikedCnt(previousLikedCnt);
      toast.error("로그인이 필요합니다.");
      console.error("좋아요 토글 에러:", err);
    }
  };

  const categoryInfo = allCategoryMap.find(
    (item) => item.label === data.category_id
  );
  const categoryIcon =
    categoryInfo?.icon ||
    allCategoryMap.find((item) => item.label === "그 외")?.icon;
  const categoryKorean = data.category_id || "그 외";

  return (
    <section
      className={`relative w-full min-h-[100svh] bg-no-repeat bg-cover bg-center ${className}`}
      style={{
        backgroundImage: data.image_url ? `url(${data.image_url})` : "none",
      }}
    >
      <div className="absolute w-full inset-0 bg-[var(--color-black)]/70 backdrop-blur-[28px] z-0" />
      <main className="relative w-full z-10 px-5 flex flex-col">
        <div className="pt-[113px] max-h-screen">
          <div className="relative w-full min-w-80 h-90 [@media(max-height:700px)]:h-60 mx-auto overflow-hidden rounded-2xl">
            <Image
              src={data.image_url || "/images/news-placeholder.png"}
              alt="news image"
              fill
              priority={isFirst}
              loading={isFirst ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={85}
              className="object-cover"
            />
          </div>

          <div className="flex mt-7 cursor-default [@media(max-height:700px)]:mt-4 w-full justify-between">
            <div className="mr-6 flex-1">
              <div className="flex gap-0.5">
                <Image
                  src={categoryIcon || ""}
                  alt={categoryKorean}
                  width={24}
                  height={24}
                  priority={isFirst}
                  loading={isFirst ? "eager" : "lazy"}
                />
                <p className="text-[var(--color-white)]">{categoryKorean}</p>
              </div>

              <div className="flex flex-col cursor-default gap-2 mt-2 [@media(max-height:700px)]:gap-0.5">
                <h1 className="text-lg font-bold text-[var(--color-white)] line-clamp-2">
                  {data.title}
                </h1>
                <span className="min-h-15 text-[var(--color-gray-60)] text-sm mt-2 text-ellipsis line-clamp-3 [@media(max-height:70px)]:line-clamp-2">
                  {data.content}
                </span>

                {/* 버튼 영역 */}
                <div className="flex gap-[7px] mt-14 [@media(max-height:700px)]:mt-4">
                  <TextButton
                    className="w-[97px] h-9 px-4 bg-[var(--color-white)]/10 hover:bg-[var(--color-white)]/15"
                    onClick={handleSummary}
                  >
                    <p className="text-sm whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#F0FFBC] to-[var(--color-primary-40)]">
                      AI 세줄요약
                    </p>
                  </TextButton>
                  <TextButton
                    className="w-[81px] h-9 px-2 text-white bg-[var(--color-white)]/10 hover:bg-[var(--color-white)]/15"
                    onClick={handleDetail}
                  >
                    <p className="text-sm whitespace-nowrap">원문보기</p>
                  </TextButton>
                </div>
              </div>
            </div>

            {/* 스크랩 / 좋아요 / 조회수 영역 */}
            <div className="flex flex-col justify-end">
              <div className="flex flex-col [@media(max-height:700px)]:gap-4 gap-6">
                {userId && (
                  <div className="flex flex-col gap-1.5">
                    <BookmarkButton
                      icon={isBookmarked ? IoBookmark : IoBookmarkOutline}
                      className={`cursor-pointer transition-opacity duration-300 ${
                        isBookmarked ? "opacity-100" : "opacity-80"
                      }`}
                      color="var(--color-white)"
                      size={24}
                      onClick={handleBookmark}
                    />
                    <p className="text-[var(--color-white)] text-xs font-normal whitespace-nowrap">
                      스크랩
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-1.5 items-center">
                  <AiOutlineLike
                    className={`w-6 h-6 cursor-pointer transition-colors duration-300 ${
                      isLiked ? "text-[var(--color-primary-40)]" : "text-white"
                    }`}
                    onClick={handleLike}
                  />
                  <p className="text-[var(--color-white)] text-[13px] font-normal text-center">
                    {likedCnt}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-center">
                  <IoEyeOutline className="text-[var(--color-white)] w-6 h-6" />
                  <p className="text-[var(--color-white)] text-[13px] font-normal text-center">
                    {viewCnt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
