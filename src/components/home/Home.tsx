"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Footer from "../layout/footer";
import Header from "../layout/header";
import NewsSection from "./NewsSection";
import { useAutoNewsFetch } from "@/hooks/useAutoNewsFetch";
import { useNewsData } from "@/hooks/useNewsData";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import ModalPortal from "../ui/ModalPortal";
import { useHomeRender } from "@/hooks/useHomeRender";
import Splash from "./Splash";
const SummaryModal = dynamic(() => import("../ui/SummaryModal"), {
  ssr: false,
});

export default function Home() {
  const [selectedNews, setSelectedNews] = useState<SupabaseNewsData | null>(
    null
  );
  const mainRef = useRef<HTMLElement>(null);
  const router = useRouter();

  // useNewsData 훅으로 뉴스 데이터 가져오기
  const { data: newsData = [], isError, isLoading, isFetching } = useNewsData();

  useAutoNewsFetch();

  const newsIds = useMemo(
    () => newsData.map((news) => news.news_id),
    [newsData]
  );
  const { data: interactions } = useHomeRender(newsIds);

  // 스크롤 시 요약 모달 닫기
  useEffect(() => {
    const mainSection = mainRef.current;
    if (!mainSection) return;

    const handleScroll = () => {
      if (selectedNews) {
        setSelectedNews(null);
      }
    };

    mainSection.addEventListener("scroll", handleScroll);
    return () => {
      mainSection.removeEventListener("scroll", handleScroll);
    };
  }, [selectedNews]);

  // 요약보기 버튼 핸들러
  const handleSummaryClick = (news: SupabaseNewsData) => {
    setSelectedNews(news);
  };

  // 원문 보기 버튼 클릭 시 디테일 페이지로 이동
  const handleViewOriginalClick = useCallback(
    (news: SupabaseNewsData) => {
      router.push(`/newsDetail/${news.news_id}`);
    },
    [router]
  );

  if ((isLoading || isFetching) && newsData.length === 0) {
    return <Splash />;
  }
  return (
    <>
      <div className="h-screen scrollbar-hide">
        <Header logo={true} page="nuPick" />
        <main
          ref={mainRef}
          className="h-screen overflow-y-scroll snap-y snap-mandatory"
        >
          {!isError &&
            newsData &&
            newsData.length > 0 &&
            newsData.map((data: SupabaseNewsData, idx: number) => (
              <NewsSection
                key={data.news_id}
                className="snap-start"
                data={data}
                likes={
                  interactions?.likeCounts[data.news_id] || data.like_count || 0
                }
                views={data.view_count || 0}
                isLiked={interactions?.likes.has(data.news_id) || false}
                isBookmarked={
                  interactions?.bookmarks.has(data.news_id) || false
                }
                handleSummary={() => handleSummaryClick(data)}
                handleDetail={() => handleViewOriginalClick(data)}
                newsId={data.news_id}
                isFirst={idx === 0}
              />
            ))}
        </main>
        <Footer isNuPick />
        {selectedNews && (
          <ModalPortal>
            <div
              key={selectedNews.news_id}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full px-2.5 z-[999] max-w-[1024px] pointer-events-none"
            >
              <div className="pointer-events-auto">
                <SummaryModal
                  isOpen
                  onClose={() => setSelectedNews(null)}
                  newsContent={selectedNews.content || ""}
                  newsId={selectedNews.news_id || ""}
                />
              </div>
            </div>
          </ModalPortal>
        )}
      </div>
    </>
  );
}
