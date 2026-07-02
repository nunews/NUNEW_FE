import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getKoreanCategoryFromUUID } from "@/lib/api/getNewstoSupabase";
import {
  fetchScrapedContent,
  isContentSufficient,
} from "@/lib/api/fetchScrapedContent";
import NewsDetailClient from "./NewsDetailClient";

// ISR: 1시간마다 재생성
export const revalidate = 3600;

// 크롤링이 필요한 최소 본문 길이
const MIN_CONTENT_LENGTH = 100;

async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
}

async function getNewsData(newsId: string) {
  const supabase = await createServerSupabase();

  const { data: newsData, error } = await supabase
    .from("News")
    .select("*")
    .eq("news_id", newsId)
    .single();

  if (error || !newsData) {
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
    const scrapedContent = await fetchScrapedContent(
      newsData.source,
      newsData.url
    );

    if (scrapedContent && scrapedContent.length > (finalContent?.length ?? 0)) {
      finalContent = scrapedContent;
    }
  }

  return {
    news_id: newsData.news_id,
    category_id: koreanCategory,
    title: newsData.title,
    content: finalContent,
    source: newsData.source,
    published_at: newsData.published_at
      ? new Date(newsData.published_at).toISOString()
      : new Date().toISOString(),
    url: newsData.url,
    view_count: newsData.view_count ?? 0,
    like_count: newsData.like_count ?? 0,
    image_url: newsData.image_url,
  };
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const newsData = await getNewsData(id);

  if (!newsData) {
    return {
      title: "뉴스를 찾을 수 없습니다 | 누뉴",
    };
  }

  const description =
    newsData.content?.slice(0, 155) + "..." || "누뉴에서 쉽게 읽는 뉴스";

  return {
    title: `${newsData.title} | 누뉴`,
    description,
    openGraph: {
      title: newsData.title,
      description,
      type: "article",
      publishedTime: newsData.published_at,
      images: newsData.image_url
        ? [
            {
              url: newsData.image_url,
              width: 1200,
              height: 630,
              alt: newsData.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: newsData.title,
      description,
      images: newsData.image_url ? [newsData.image_url] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const newsData = await getNewsData(id);

  if (!newsData) {
    notFound();
  }

  return <NewsDetailClient newsData={newsData} />;
}
