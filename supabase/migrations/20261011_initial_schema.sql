-- HandWrite AI Database Schema & Migration
-- Supabase PostgreSQL with Row Level Security (RLS)
-- Enables strict per-user multi-tenant isolation

-- 1. Create custom types
CREATE TYPE IF NOT EXISTS profile_processing_status AS ENUM ('pending', 'analyzing', 'ready', 'failed');
CREATE TYPE IF NOT EXISTS assignment_status AS ENUM ('drafting', 'extracted', 'reviewing', 'rendered', 'exported');

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- 3. Handwriting Profiles table
CREATE TABLE IF NOT EXISTS public.handwriting_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  sample_file_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  style_settings JSONB NOT NULL DEFAULT '{
    "fontFamily": "Caveat",
    "fontSize": 18,
    "lineSpacing": 1.7,
    "wordSpacing": 2.0,
    "letterSpacing": 0.5,
    "slantAngle": 0,
    "inkColor": "#1e3a8a",
    "paperStyle": "ruled",
    "pageSize": "a4",
    "strokeWidth": 1.2
  }'::JSONB,
  processing_status profile_processing_status DEFAULT 'ready',
  analysis_notes JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  course_name TEXT,
  language TEXT DEFAULT 'en',
  instructions TEXT,
  target_length TEXT DEFAULT 'medium',
  paper_size TEXT DEFAULT 'a4',
  source_material_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  extracted_text TEXT,
  draft_content TEXT,
  status assignment_status DEFAULT 'drafting',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Generated Documents table
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  handwriting_profile_id UUID REFERENCES public.handwriting_profiles(id) ON DELETE SET NULL,
  style_settings JSONB NOT NULL,
  pdf_file_path TEXT,
  page_image_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  page_count INT DEFAULT 1,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Usage Records (for quota, audit, and subscription tracking)
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL, -- e.g., 'ai_draft_generated', 'ocr_processed', 'pdf_exported'
  status TEXT DEFAULT 'success',
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Indexes for fast user queries
CREATE INDEX IF NOT EXISTS idx_handwriting_profiles_user_id ON public.handwriting_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_user_id ON public.generated_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handwriting_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- 9. Strict RLS Policies - Every user can only access their own records
-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Handwriting Profiles policies
CREATE POLICY "Users can view their own handwriting profiles"
  ON public.handwriting_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own handwriting profiles"
  ON public.handwriting_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own handwriting profiles"
  ON public.handwriting_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own handwriting profiles"
  ON public.handwriting_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Assignments policies
CREATE POLICY "Users can view their own assignments"
  ON public.assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments"
  ON public.assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments"
  ON public.assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Generated Documents policies
CREATE POLICY "Users can view their own generated documents"
  ON public.generated_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated documents"
  ON public.generated_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated documents"
  ON public.generated_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated documents"
  ON public.generated_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Usage Records policies
CREATE POLICY "Users can view their own usage records"
  ON public.usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage records"
  ON public.usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. Storage Bucket Setup & Security
-- Storage buckets required:
--   'handwriting-samples' (private)
--   'assignment-materials' (private)
--   'exported-documents' (private)

-- Storage RLS:
-- Note: users can only upload and read files inside their own folder: `${auth.uid()}/...`
