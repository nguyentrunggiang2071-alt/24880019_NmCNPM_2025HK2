-- ================================================================
-- Research Paper Aggregator - Initial Database Schema
-- Supabase (PostgreSQL)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE: profiles
-- Mở rộng bảng auth.users mặc định của Supabase
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- TABLE: topics
-- Chủ đề / từ khóa mà người dùng quan tâm
-- ================================================================
CREATE TABLE IF NOT EXISTS public.topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  keywords    TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- TABLE: articles
-- Bài báo khoa học thu thập từ arXiv và các nguồn khác
-- ================================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arxiv_id      TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  authors       TEXT[] NOT NULL DEFAULT '{}',
  abstract      TEXT NOT NULL,
  published_at  TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL,
  pdf_url       TEXT NOT NULL DEFAULT '',
  source_url    TEXT NOT NULL DEFAULT '',
  topic_tags    TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- TABLE: summaries
-- Tóm tắt bài báo do AI tạo ra (Gemini)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.summaries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  model_used  TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id)
);

-- ================================================================
-- TABLE: favorites
-- Bài báo yêu thích của người dùng
-- ================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- ================================================================
-- INDEXES - Tối ưu hóa truy vấn
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_arxiv_id ON public.articles(arxiv_id);
CREATE INDEX IF NOT EXISTS idx_articles_title_abstract ON public.articles USING gin(to_tsvector('english', title || ' ' || abstract));
CREATE INDEX IF NOT EXISTS idx_summaries_article_id ON public.summaries(article_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_article_id ON public.favorites(article_id);

-- ================================================================
-- TRIGGER: Tự động tạo profile khi user đăng ký
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- TRIGGER: Cập nhật updated_at tự động
-- ================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_topics_updated_at ON public.topics;
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- RLS (Row Level Security) - Bảo mật dữ liệu
-- ================================================================

-- Bật RLS cho tất cả bảng
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites  ENABLE ROW LEVEL SECURITY;

-- profiles: người dùng chỉ đọc/ghi profile của mình
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- topics: người dùng chỉ quản lý topic của mình
DROP POLICY IF EXISTS "topics_all_own" ON public.topics;
CREATE POLICY "topics_all_own" ON public.topics
  FOR ALL USING (auth.uid() = user_id);

-- articles: công khai (tất cả người dùng đều đọc được)
DROP POLICY IF EXISTS "articles_select_public" ON public.articles;
CREATE POLICY "articles_select_public" ON public.articles
  FOR SELECT USING (true);

-- Chỉ service role mới được insert/update articles (ingestion backend)
DROP POLICY IF EXISTS "articles_insert_service" ON public.articles;
CREATE POLICY "articles_insert_service" ON public.articles
  FOR INSERT WITH CHECK (true);

-- summaries: công khai đọc, service role ghi
DROP POLICY IF EXISTS "summaries_select_public" ON public.summaries;
CREATE POLICY "summaries_select_public" ON public.summaries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "summaries_insert_service" ON public.summaries;
CREATE POLICY "summaries_insert_service" ON public.summaries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "summaries_update_service" ON public.summaries;
CREATE POLICY "summaries_update_service" ON public.summaries
  FOR UPDATE USING (true);

-- favorites: người dùng chỉ quản lý favorites của mình
DROP POLICY IF EXISTS "favorites_all_own" ON public.favorites;
CREATE POLICY "favorites_all_own" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- SAMPLE DATA (tùy chọn - để test)
-- ================================================================
-- INSERT INTO public.articles (arxiv_id, title, authors, abstract, published_at, updated_at, pdf_url, source_url, topic_tags)
-- VALUES (
--   '2401.00001',
--   'Sample Paper on Machine Learning',
--   ARRAY['Author One', 'Author Two'],
--   'This is a sample abstract about machine learning and AI...',
--   '2024-01-01 00:00:00+00',
--   '2024-01-01 00:00:00+00',
--   'https://arxiv.org/pdf/2401.00001',
--   'https://arxiv.org/abs/2401.00001',
--   ARRAY['cs.LG', 'machine learning']
-- );
