"use client";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HotNewsCard from "@/components/ui/HotNewsCard";
import DefaultCard from "@/components/ui/DefaultCard";
import hotICon from "@/assets/images/fire.png";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Swiper } from "swiper/react";
import { SwiperSlide } from "swiper/react";
import "swiper/css";
import PostCard from "@/components/ui/PostCard";
import { TextButton } from "@/components/ui/TextButton";
import CategoryFilter from "@/components/mypage/CategoryFilter";
import { timeAgo } from "@/utils/date";
import { fetchPost, fetchWriter } from "../api/community";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import { useAuthStore } from "@/stores/authStore";
import { useHomeRender } from "@/hooks/useHomeRender";
import { useAllPickNews } from "@/hooks/useAllPickNews";
import { useToggleBookmarkMutation } from "@/hooks/useNewsInteractionMutations";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type MyPost = Post & {
  User?: {
    profile_image?: string | null;
    nickname?: string | null;
  };
};

export default function AllPickPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [postData, setPostData] = useState<MyPost[]>([]);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const { data, isLoading, isError } = useAllPickNews(selectedCategory);

  const router = useRouter();
  const userId = useAuthStore((state) => state.userId);
  const bookmarkMutation = useToggleBookmarkMutation();

  const handlePostCreate = () => {
    router.push("/community/postCreate");
  };

  const transformedNews = useMemo(
    () =>
      (data ?? [])
        .sort(() => Math.random() - 0.5)
        .map((news) => ({
          ...news,
          newsId: news.news_id,
          timeAgo: timeAgo(news.published_at),
          image: news.image_url,
          likes: news.like_count || 0,
          views: news.view_count || 0,
        })),

    [data]
  );

  // 뉴스 ID 목록 추출
  const newsIds = useMemo(
    () => transformedNews.map((news) => news.news_id),
    [transformedNews]
  );

  // 상호작용 데이터 가져오기 (좋아요, 북마크, 좋아요 수)
  const { data: interactions } = useHomeRender(newsIds);
  const queryClient = useQueryClient();

  const handleBookmark = async (e: React.MouseEvent, newsId: string) => {
    e.stopPropagation();

    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const isBookmarked = interactions?.bookmarks?.has(newsId) ?? false;

    try {
      await bookmarkMutation.mutateAsync({
        newsId,
        userId,
        isBookmarked,
      });
      queryClient.invalidateQueries({
        queryKey: ["homeRender"],
      });

      toast.success(
        isBookmarked ? "스크랩을 취소했어요." : "스크랩에 추가됐어요."
      );
    } catch (err) {
      toast.error("스크랩 처리에 실패했습니다.");
      console.error("북마크 토글 에러:", err);
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsPostLoading(true);
        const posts = await fetchPost();

        const postWithUserInfo = await Promise.all(
          posts.map(async (post) => {
            const userProfile = await fetchWriter(post.user_id);
            return {
              ...post,
              User: userProfile,
            };
          })
        );
        setPostData(postWithUserInfo as MyPost[]);
      } catch (error) {
        console.error("게시글 데이터 가져오기 실패", error);
        setPostData([]);
      } finally {
        setIsPostLoading(false);
      }
    };
    fetchPostData();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="h-screen scrollbar-hide bg-[var(--color-white)] dark:bg-[#121212]">
        <Header logo={true} />
        <main className="h-screen overflow-y-scroll pt-16 pb-18">
          <div>
            <div className="px-4 whitespace-nowrap">
              <CategoryFilter
                activeCategory={selectedCategory}
                setActiveCategory={setSelectedCategory}
              />
            </div>

            {/* 핫 뉴스 */}
            <div className="flex flex-col mb-5 px-4 mt-7.5">
              <div className="flex gap-1">
                <Image
                  src={hotICon}
                  alt="핫 뉴스 아이콘"
                  width={26}
                  height={26}
                  style={{ width: "26px", height: "26px" }}
                />
                <h2 className="text-lg font-bold text-[var(--color-black)] dark:text-[var(--color-white)] mb-4">
                  오늘의 핫뉴스
                </h2>
              </div>
              <div className="flex overflow-x-auto pb-2 scrollbar-hide">
                <Swiper
                  spaceBetween={16}
                  slidesPerView="auto"
                  grabCursor={true}
                  freeMode={true}
                >
                  {transformedNews.slice(0, 4).map((news) => (
                    <SwiperSlide key={news.news_id} className="!w-[300px]">
                      <HotNewsCard
                        newsId={news.news_id || ""}
                        userId={userId}
                        title={news.title}
                        category={news.category_id}
                        timeAgo={timeAgo(news.published_at)}
                        likes={
                          interactions?.likeCounts[news.news_id] ||
                          news.like_count ||
                          0
                        }
                        views={news.view_count || 0}
                        image={news.image_url || ""}
                        isBookmarked={
                          interactions?.bookmarks.has(news.news_id) ?? false
                        }
                        handleBookmark={(e) => handleBookmark(e, news.news_id)}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* 세로 뉴스 */}
            <div className="px-4">
              <h2 className="text-lg font-bold text-[var(--color-black)] dark:text-[var(--color-white)] mt-8">
                모든 뉴스
              </h2>
              <div>
                {transformedNews.slice(0, 5).map((news) => (
                  <DefaultCard
                    key={news.news_id}
                    newsId={news.news_id!}
                    userId={userId}
                    title={news.title}
                    category={news.category_id}
                    timeAgo={timeAgo(news.published_at)}
                    likes={
                      interactions?.likeCounts[news.news_id] ||
                      news.like_count ||
                      0
                    }
                    views={news.view_count || 0}
                    image={news.image_url || ""}
                    isBookmarked={
                      interactions?.bookmarks.has(news.news_id) ?? false
                    }
                    handleBookmark={(e) => handleBookmark(e, news.news_id)}
                  />
                ))}
              </div>
            </div>

            {/* 관심사별 추천 커뮤니티 글 */}
            <div className="w-full h-[438px] flex flex-col bg-[#f8f8f8] mt-4 pb-11 px-4 dark:bg-[var(--color-black)]">
              <h2 className="text-lg font-bold text-[#191919] dark:text-[var(--color-white)] mt-10 mb-5">
                나의 관심사에 대해 <br />
                사람들과 대화해 보세요!
              </h2>
              <div className="flex-1 mb-4">
                <Swiper
                  spaceBetween={10}
                  slidesPerView={1.2}
                  grabCursor={true}
                  freeMode={true}
                  navigation={false}
                  pagination={{ clickable: true }}
                >
                  {postData.map((post) => (
                    <SwiperSlide key={post?.post_id} className="!w-[278px]">
                      <PostCard
                        postId={post.post_id}
                        authorNickname={post.User?.nickname || "익명의 누누"}
                        profileImage={post.User?.profile_image || ""}
                        category={post.category_id}
                        content={post.contents}
                        likes={post.like_count ?? 0}
                        views={post.view_count ?? 0}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="flex justify-center">
                <TextButton
                  onClick={handlePostCreate}
                  className="bg-[var(--color-black)] dark:bg-[var(--color-white)] w-31 h-10 rounded-full hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-20)]"
                >
                  <p className="text-[var(--color-white)] dark:text-[var(--color-black)]">
                    글쓰러 가기
                  </p>
                </TextButton>
              </div>
            </div>

            {/* 많은 사람들이 좋아한 뉴스 */}
            <div className="flex flex-col px-4 mt-8">
              <h2 className="text-lg font-bold text-[var(--color-black)] dark:text-[var(--color-white)] mb-4">
                많은 사람들이 좋아한 뉴스
              </h2>
              {transformedNews
                .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                .slice(0, 5)
                .map((news) => (
                  <DefaultCard
                    key={news.news_id}
                    newsId={news.news_id!}
                    userId={userId}
                    title={news.title}
                    category={news.category_id}
                    timeAgo={timeAgo(news.published_at)}
                    likes={
                      interactions?.likeCounts[news.news_id] ||
                      news.like_count ||
                      0
                    }
                    views={news.view_count || 0}
                    image={news.image_url || ""}
                    isBookmarked={
                      interactions?.bookmarks.has(news.news_id) ?? false
                    }
                    handleBookmark={(e) => handleBookmark(e, news.news_id)}
                  />
                ))}
            </div>
          </div>
        </main>
        <Footer isNuPick={false} />
      </div>
    </>
  );
}
