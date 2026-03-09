"use client";
import Image from "next/image";
import {
  AiOutlineEye,
  AiOutlineLike,
  AiOutlineShareAlt,
  AiFillLike,
} from "react-icons/ai";
import { TextButton } from "@/components/ui/TextButton";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTyping } from "@/hooks/useTyping";
import { getLikesStatus } from "@/utils/likes";
import { useToggleLikeMutation } from "@/hooks/useNewsInteractionMutations";
import { useNewsSummary } from "@/hooks/useNewsSummary";
import { formatDate } from "@/utils/date";

interface NewsArticleContentProps {
  newsData: {
    news_id: string;
    category_id: string;
    title: string;
    published_at: string;
    source: string;
    view_count: number;
    image_url: string;
    content: string;
  };
}

export default function NewsArticleContent({
  newsData,
}: NewsArticleContentProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { typedRef, runTyped } = useTyping();
  const likeMutation = useToggleLikeMutation();

  const {
    isLoading: summaryLoading,
    isError: summaryError,
    showTyping,
    generateSummary,
    reset,
  } = useNewsSummary({
    newsId: newsData.news_id,
    newsContent: newsData.content,
    isOpen: showSummary,
  });

  useEffect(() => {
    if (showSummary) {
      generateSummary((text) => {
        setTimeout(() => runTyped(text), 50);
      });
    } else {
      reset();
    }
  }, [generateSummary, reset, runTyped, showSummary]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const status = await getLikesStatus(newsData.news_id);
        setIsLiked(status);
      } catch (e) {
        console.error("뉴스 좋아요 정보 로딩 실패:", e);
      }
    };

    fetchLikes();
  }, [newsData.news_id]);

  const handleSummary = () => {
    setShowSummary(true);
  };

  const handleLikeClick = async () => {
    const previousIsLiked = isLiked;
    setIsLiked(!isLiked);

    try {
      const res = await likeMutation.mutateAsync(newsData.news_id);
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
    const newsTitle = newsData.title;

    // 모바일에서는 공유, 데스크톱에서는 클립보드 복사
    if (
      /Android|webOS|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: newsTitle,
          url: currentUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // 공유 실패 시 클립보드 복사로 폴백
          await copyToClipboard(currentUrl);
        }
      }
    } else {
      // 데스크톱에서는 바로 클립보드 복사
      await copyToClipboard(currentUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다!", {
        duration: 3000,
      });
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      toast.success("링크가 복사되었습니다!");
      console.error("복사 중 에러 발생", err);
    }
  };

  return (
    <div className="px-5 pt-18">
      {/* 뉴스 헤더 */}
      <div className="text-sm text-[var(--color-gray-70)] mb-2">
        {newsData.category_id}
      </div>
      <h1 className="text-[22px] font-bold leading-[140%] mb-3">
        {newsData.title}
      </h1>
      <div className="flex items-center gap-2 text-sm text-[var(--color-gray-70)] mb-7">
        <span>{formatDate(newsData.published_at)}</span>
        <span>•</span>
        <span>{newsData.source}</span>
        <div className="flex items-center justify-end flex-1 gap-[3px]">
          <AiOutlineEye className="w-5 h-5 text-[var(--color-gray-70)]" />
          <span className="text-sm text-[var(--color-gray-70)]">
            {newsData.view_count}
          </span>
        </div>
      </div>

      {/* 뉴스 이미지 */}
      <div className="w-full h-64 mb-7.5 rounded-lg overflow-hidden">
        <Image
          src={newsData.image_url || "/images/default_nunew.svg"}
          alt="뉴스 이미지"
          width={400}
          height={256}
          className="w-full h-full object-cover"
        />
      </div>

      {/* AI 요약 버튼 */}
      <div className="mb-6 flex items-center gap-3">
        <TextButton
          onClick={handleSummary}
          className="w-[97px] h-9 px-4 bg-[var(--color-black)] hover:bg-[var(--color-gray-100)] hover:backdrop-blur-[4px]"
        >
          <p className="text-sm whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#F0FFBC] to-[var(--color-primary-40)]">
            AI 세줄요약
          </p>
        </TextButton>
        <p className="text-sm">기사를 세 줄로 요약해 드려요!</p>
      </div>

      {/* 요약 섹션 */}
      {showSummary && (
        <div className="w-full mb-6 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[var(--color-gray-10)] dark:bg-[var(--color-black)] rounded-2xl py-6 px-5 border border-[var(--color-gray-30)] dark:border-none">
            <div>
              {summaryLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--color-gray-100)] border-t-transparent"></div>
                    <p className="text-sm dark:text-[var(--color-gray-40)]">
                      요약중입니다...
                    </p>
                  </div>
                </div>
              )}

              {showTyping && !summaryLoading && (
                <div className="text-[var(--color-gray-100)] text-base leading-[140%] whitespace-pre-line">
                  <p className="dark:text-[var(--color-primary-50)] mb-5">
                    세 줄 요약
                  </p>
                  <div
                    ref={typedRef}
                    className="text-[var(--color-gray-100)] dark:text-[var(--color-gray-20)]"
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 기사 내용 */}
      <div className="mb-7.5">
        <div className="text-base leading-[160%] dark:text-[var(--color-gray-40)] whitespace-pre-line text-[var(--color-gray-100)]">
          {newsData.content}
        </div>
      </div>

      {/* 좋아요/공유 버튼 */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-[3px]">
          <TextButton
            onClick={handleLikeClick}
            className="flex items-center gap-[3px] transition-colors duration-300 dark:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-90)] text-[var(--color-black)] dark:text-white"
          >
            {isLiked ? (
              <AiFillLike className="w-5 h-5 text-[var(--color-black)] dark:text-white" />
            ) : (
              <AiOutlineLike className="w-5 h-5 text-[var(--color-black)] dark:text-white" />
            )}
            <span>{isLiked ? "좋아요" : "좋아요"}</span>
          </TextButton>
        </div>
        <div className="flex items-center gap-[3px]">
          <TextButton
            onClick={handleShare}
            className="flex items-center gap-[3px] dark:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-90)]"
            color="default"
          >
            <AiOutlineShareAlt className="w-5 h-5 text-[var(--color-black)] dark:text-white dark:hover:text-[var(--color-gray-10)]" />
            <span className="text-[var(--color-black)] dark:text-white  dark:hover:text-[var(--color-gray-10)]">
              공유하기
            </span>
          </TextButton>
        </div>
      </div>
    </div>
  );
}
