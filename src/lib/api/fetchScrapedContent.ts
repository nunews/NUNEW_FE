import { SCRAPER_CONFIG } from "../config";

interface ScrapeResponse {
  htmlContent: string;
  cached: boolean;
}

interface ScrapeError {
  error: string;
  message?: string;
}

/**
 * @param sourceName 언론사 이름
 * @param url 뉴스 기사 URL
 * @returns 크롤링된 본문 내용 또는 null
 */
export async function fetchScrapedContent(
  sourceName: string,
  url: string,
): Promise<string | null> {
  // 지원하는 언론사인지 확인
  if (!SCRAPER_CONFIG.SUPPORTED_SOURCES.includes(sourceName)) {
    console.log(`[fetchScrapedContent] 지원하지 않는 언론사: ${sourceName}`);
    return null;
  }

  try {
    const params = new URLSearchParams({
      source_name: sourceName,
      url: url,
    });

    const response = await fetch(
      `${SCRAPER_CONFIG.BASE_URL}/scrape?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData: ScrapeError = await response.json();
      console.error("[fetchScrapedContent] 크롤링 실패:", errorData);
      return null;
    }

    const data: ScrapeResponse = await response.json();
    console.log(
      `[fetchScrapedContent] 본문 가져옴 (캐시: ${data.cached}, 길이: ${data.htmlContent.length})`,
    );

    return data.htmlContent;
  } catch (error) {
    console.error("[fetchScrapedContent] 크롤링 서버 요청 실패:", error);
    return null;
  }
}

/**
 *
 * @param content 뉴스 본문
 * @param minLength 최소 길이 (기본값: 100자)
 */
export function isContentSufficient(
  content: string | null | undefined,
  minLength: number = 100,
): boolean {
  if (!content) return false;
  return content.trim().length >= minLength;
}
