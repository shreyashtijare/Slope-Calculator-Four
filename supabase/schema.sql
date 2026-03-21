-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FOLDERS
-- =====================================================
CREATE TABLE public.folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#007bff',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROJECTS
-- =====================================================
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  zoom_level INTEGER DEFAULT 12,
  map_style TEXT DEFAULT 'road',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_archived BOOLEAN DEFAULT false,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROJECT SHARES
-- =====================================================
CREATE TABLE public.project_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  permission TEXT DEFAULT 'view',
  shared_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SHAPES
-- =====================================================
CREATE TABLE public.shapes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  name TEXT,
  type TEXT,
  coordinates JSONB,
  area_m2 DOUBLE PRECISION,
  perimeter_m DOUBLE PRECISION,
  style JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

ALTER TABLE public.shapes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MEASUREMENTS
-- =====================================================
CREATE TABLE public.measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  name TEXT,
  coordinates JSONB,
  total_distance_m DOUBLE PRECISION,
  segment_distances JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS
-- =====================================================
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content TEXT,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EXPORTS
-- =====================================================
CREATE TABLE public.exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  filename TEXT,
  file_url TEXT,
  format TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ACTIVITY LOG
-- =====================================================
CREATE TABLE public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  action TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- REALTIME CURSORS
-- =====================================================
CREATE TABLE public.realtime_cursors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.realtime_cursors ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BASIC POLICIES
-- =====================================================

-- profiles
CREATE POLICY "profiles owner"
ON public.profiles
FOR ALL
USING (auth.uid() = id);

-- projects
CREATE POLICY "projects owner"
ON public.projects
FOR ALL
USING (auth.uid() = user_id);

-- folders
CREATE POLICY "folders owner"
ON public.folders
FOR ALL
USING (auth.uid() = user_id);

-- shapes
CREATE POLICY "shapes access"
ON public.shapes
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- measurements
CREATE POLICY "measurements access"
ON public.measurements
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- comments
CREATE POLICY "comments access"
ON public.comments
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- shares
CREATE POLICY "shares owner"
ON public.project_shares
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);
