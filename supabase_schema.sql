-- =============================================
-- NUNEWS Supabase Database Schema
-- =============================================

-- 1. Category 테이블 (카테고리 UUID)
CREATE TABLE IF NOT EXISTS "Category" (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 데이터 삽입
INSERT INTO "Category" (category_id, category_name) VALUES
  ('6cb26f12-f252-4dc5-84e1-ca6508c9be92', '정치'),
  ('2f5526ca-a4b5-4528-a6ca-4ac77760ad6a', '경제'),
  ('63bbfd28-d719-40a3-9e4e-a6a35d18a488', '연예'),
  ('6136d802-9c55-4448-a8e8-0dbc9c8d80d4', '스포츠'),
  ('618130f2-41dd-4c08-8e93-160d915b7fae', '사회'),
  ('64b6f453-629b-4028-a264-4c49d4aa8391', '문화'),
  ('24974ecd-6171-484a-a4ed-e1ee023a1d32', '해외'),
  ('7108b7f8-40b8-4ad0-bb3a-643cea8e807d', '그 외')
ON CONFLICT (category_id) DO NOTHING;

-- 2. News 테이블 (뉴스 기사)
CREATE TABLE IF NOT EXISTS "News" (
  news_id TEXT PRIMARY KEY,
  category_id UUID REFERENCES "Category"(category_id),
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT
);

-- News 인덱스
CREATE INDEX IF NOT EXISTS idx_news_category ON "News"(category_id);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON "News"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON "News"(source);

-- 3. news_summary 테이블 (AI 요약)
CREATE TABLE IF NOT EXISTS "news_summary" (
  summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id TEXT UNIQUE REFERENCES "News"(news_id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User 테이블 (사용자)
CREATE TABLE IF NOT EXISTS "User" (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  profile_image TEXT,
  age_range TEXT,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User 인덱스
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_nickname ON "User"(nickname);

-- 5. User_Interests 테이블 (사용자 관심사)
CREATE TABLE IF NOT EXISTS "User_Interests" (
  interest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  category_id UUID REFERENCES "Category"(category_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- 6. Post 테이블 (커뮤니티 게시글)
CREATE TABLE IF NOT EXISTS "Post" (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  category_id UUID REFERENCES "Category"(category_id),
  title TEXT NOT NULL,
  contents TEXT NOT NULL,
  content_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);

-- Post 인덱스
CREATE INDEX IF NOT EXISTS idx_post_user ON "Post"(user_id);
CREATE INDEX IF NOT EXISTS idx_post_category ON "Post"(category_id);
CREATE INDEX IF NOT EXISTS idx_post_created_at ON "Post"(created_at DESC);

-- 7. Comments 테이블 (댓글)
CREATE TABLE IF NOT EXISTS "Comments" (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  post_id UUID REFERENCES "Post"(post_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post ON "Comments"(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON "Comments"(user_id);

-- 8. Like 테이블 (좋아요)
CREATE TABLE IF NOT EXISTS "Like" (
  like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  post_id UUID REFERENCES "Post"(post_id) ON DELETE CASCADE,
  comment_id UUID REFERENCES "Comments"(comment_id) ON DELETE CASCADE,
  news_id TEXT REFERENCES "News"(news_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL AND news_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL AND news_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NULL AND news_id IS NOT NULL)
  )
);

-- Like 인덱스
CREATE INDEX IF NOT EXISTS idx_like_user ON "Like"(user_id);
CREATE INDEX IF NOT EXISTS idx_like_post ON "Like"(post_id);
CREATE INDEX IF NOT EXISTS idx_like_comment ON "Like"(comment_id);
CREATE INDEX IF NOT EXISTS idx_like_news ON "Like"(news_id);

-- 9. Bookmark 테이블 (북마크 - 스크랩)
CREATE TABLE IF NOT EXISTS "Bookmark" (
  bookmark_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  news_id TEXT REFERENCES "News"(news_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, news_id)
);

-- Bookmark 인덱스
CREATE INDEX IF NOT EXISTS idx_bookmark_user ON "Bookmark"(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_news ON "Bookmark"(news_id);

-- 10. News_View_Log 테이블 (뉴스 조회 로그)
CREATE TABLE IF NOT EXISTS "News_View_Log" (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  news_id TEXT REFERENCES "News"(news_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News_View_Log 인덱스
CREATE INDEX IF NOT EXISTS idx_news_view_log_user ON "News_View_Log"(user_id);
CREATE INDEX IF NOT EXISTS idx_news_view_log_news ON "News_View_Log"(news_id);
CREATE INDEX IF NOT EXISTS idx_news_view_log_created_at ON "News_View_Log"(created_at DESC);

-- =============================================
-- Triggers (자동 User 생성)
-- =============================================

-- 새 유저 가입 시 User 테이블에 자동으로 레코드 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (user_id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 유저 생성 시 트리거 실행
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- RPC Functions (조회수 증가 등)
-- =============================================

-- 뉴스 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_news_view(p_news_id TEXT, p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- 조회수 증가
  UPDATE "News"
  SET view_count = view_count + 1
  WHERE news_id = p_news_id;

  -- 조회 로그 기록 (user_id가 있을 때만)
  IF p_user_id IS NOT NULL THEN
    INSERT INTO "News_View_Log" (user_id, news_id)
    VALUES (p_user_id, p_news_id);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 게시글 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_post_view(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE "Post"
  SET view_count = view_count + 1
  WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Row Level Security (RLS) 설정
-- =============================================

-- News 테이블: 모든 사용자 읽기 가능
ALTER TABLE "News" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News are viewable by everyone" ON "News" FOR SELECT USING (true);
CREATE POLICY "News are insertable by authenticated users" ON "News" FOR INSERT WITH CHECK (true);

-- User 테이블: 자신의 데이터만 수정 가능
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone" ON "User" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert user" ON "User" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON "User" FOR UPDATE USING (auth.uid() = user_id);

-- Post 테이블
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone" ON "Post" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON "Post" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON "Post" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON "Post" FOR DELETE USING (auth.uid() = user_id);

-- Comments 테이블
ALTER TABLE "Comments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON "Comments" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON "Comments" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own comments" ON "Comments" FOR DELETE USING (auth.uid() = user_id);

-- Like 테이블
ALTER TABLE "Like" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON "Like" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON "Like" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can unlike" ON "Like" FOR DELETE USING (auth.uid() = user_id);

-- Bookmark 테이블
ALTER TABLE "Bookmark" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bookmarks viewable by owner" ON "Bookmark" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark" ON "Bookmark" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unbookmark" ON "Bookmark" FOR DELETE USING (auth.uid() = user_id);

-- User_Interests 테이블
ALTER TABLE "User_Interests" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User interests viewable by everyone" ON "User_Interests" FOR SELECT USING (true);
CREATE POLICY "Users can insert own interests" ON "User_Interests" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own interests" ON "User_Interests" FOR DELETE USING (auth.uid() = user_id);

-- News_View_Log 테이블
ALTER TABLE "News_View_Log" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News view logs viewable by everyone" ON "News_View_Log" FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert view logs" ON "News_View_Log" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own view logs" ON "News_View_Log" FOR DELETE USING (auth.uid() = user_id);
