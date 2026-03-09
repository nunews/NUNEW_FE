import supabase from "../supabase";
import { getKoreanCategoryFromUUID } from "./getNewstoSupabase";
import {
  fetchScrapedContent,
  isContentSufficient,
} from "./fetchScrapedContent";

// 크롤링이 필요한 최소 본문 길이
const MIN_CONTENT_LENGTH = 100;

export const getSupabaseOneNews = async (newsId: string) => {
  try {
    const { data: newsData, error } = await supabase
      .from("News")
      .select("*")
      .eq("news_id", newsId)
      .single();

    if (error) {
      console.error("해당 뉴스를 찾지 못했습니다.", error);
      return null;
    }

    if (!newsData) {
      return null;
    }

    const koreanCategory = getKoreanCategoryFromUUID(newsData.category_id);
    let finalContent = newsData.content;

    // 본문이 부족하면 크롤링 서버에서 가져오기 시도
    if (
      !isContentSufficient(newsData.content, MIN_CONTENT_LENGTH) &&
      newsData.url &&
      newsData.source
    ) {
      console.log(
        `[getSupabaseOneNews] 본문 부족 (${newsData.content?.length ?? 0}자), 크롤링 시도...`
      );

      const scrapedContent = await fetchScrapedContent(
        newsData.source,
        newsData.url
      );

      if (scrapedContent && scrapedContent.length > (finalContent?.length ?? 0)) {
        finalContent = scrapedContent;
        console.log(
          `[getSupabaseOneNews] 크롤링 성공, 본문 길이: ${finalContent.length}자`
        );
      }
    }

    return {
      news_id: newsData.news_id,
      category_id: koreanCategory, // 한글 카테고리명으로 변환된 값
      title: newsData.title,
      content: finalContent,
      source: newsData.source,
      published_at: newsData.published_at
        ? new Date(newsData.published_at).toISOString()
        : new Date().toISOString(),
      url: newsData.url,
      view_count: newsData.view_count ?? 0,
      like_count: newsData.like_count ?? 0,
      created_at: newsData.created_at,
      image_url: newsData.image_url,
    };
  } catch (error) {
    console.error("해당 뉴스를 가져오는 중 오류가 발생했습니다.", error);
    return null;
  }
};
