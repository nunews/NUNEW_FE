export const API_CONFIG: ApiConfig = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
  NEWSDATA_API_KEY: process.env.NEXT_PUBLIC_NEWS_IO_KEY || "",
};

// 크롤링 서버 설정
export const SCRAPER_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_SCRAPER_URL || "https://nunew-scraper-z6qx.onrender.com",
  // 크롤링 지원 언론사 목록
  SUPPORTED_SOURCES: [
    "동아일보",
    "매일경제",
    "매일 경제",
    "Sbs 뉴스",
    "SBS",
    "Sbs",
    "스포츠조선",
    "Mbn",
    "mbn",
    "오마이뉴스",
    "Ohmynews",
    "이투데이",
    "Chosun",
    "Hani",
  ],
};

// OpenAI 설정
export const OPENAI_CONFIG = {
  API_KEY: API_CONFIG.OPENAI_API_KEY,
  BASE_URL: "https://api.openai.com/v1",
  MODEL: "gpt-4o",
  MAX_TOKENS: 200,
  TEMPERATURE: 0.7,
};
