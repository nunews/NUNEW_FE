"use server";

import { saveNewstoSupabase } from "@/lib/api/saveNewstoSupabase";
import { fetchNewsData } from "../api/fetchNews";
import { getSupabaseRandomNews } from "../api/getNewstoSupabase";
import supabase from "../supabase";

async function isDataStale(): Promise<boolean> {
  try {
    const { data: latestNews } = await supabase
      .from("News")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!latestNews?.created_at) {
      return true;
    }

    const lastFetchTime = new Date(latestNews?.created_at).getTime();
    const now = Date.now();
    const halfHour = 30 * 60 * 1000;

    console.log(`마지막 패치: ${new Date(lastFetchTime).toLocaleString()}`);
    return now - lastFetchTime > halfHour;
  } catch (error) {
    console.error("데이터 신선도 확인 실패:", error);
    return true;
  }
}
export async function loadNewsData(): Promise<SupabaseNewsData[]> {
  try {
    const existingNews = await getSupabaseRandomNews();
    const refreshNews = await isDataStale();

    if (!refreshNews) {
      console.log("뉴스가 최신 상태입니다.");
      return existingNews;
    }

    // 신선하지 않으면 외부 API에서 새 데이터 패치
    console.log("새로 패치 중...");
    const fetchedNews = await fetchNewsData("ko");

    if (!fetchedNews?.length) {
      console.warn("새로운 뉴스가 없습니다. 기존 뉴스 반환");
      return existingNews;
    }

    const transformedData: NewsData[] = fetchedNews.map((data: NewsData) => {
      return {
        article_id: data.article_id,
        category: data.category[0] || "etc",
        description: data.description || "내용이 없습니다.",
        image_url: data.image_url,
        language: data.language,
        link: data.link,
        pubDate: new Date(data.pubDate).toISOString(),
        source_name: data.source_name,
        source_url: data.source_url,
        title: data.title,
      };
    });

    await saveNewstoSupabase(transformedData);

    return existingNews;
  } catch (error) {
    console.error("뉴스 로딩 실패:", error);
    return [];
  }
}
