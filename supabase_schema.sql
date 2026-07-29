-- UNDRGRND Docs — Supabase Schema
-- Clean schema for documentary streaming platform

-- Documentaries table
CREATE TABLE IF NOT EXISTS public.documentaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  description TEXT,
  genre TEXT DEFAULT 'Documentary',
  year TEXT,
  runtime TEXT,
  video_url TEXT,
  poster_url TEXT,
  license TEXT DEFAULT 'Public Domain',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creators table
CREATE TABLE IF NOT EXISTS public.creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User accounts (for future auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watch progress (tracks where a user left off)
CREATE TABLE IF NOT EXISTS public.watch_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  documentary_id UUID REFERENCES public.documentaries(id) ON DELETE CASCADE,
  progress_pct NUMERIC(5,2) DEFAULT 0.00,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, documentary_id)
);

-- Row-level security
ALTER TABLE public.documentaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for documentaries and creators
CREATE POLICY "Public can view documentaries"
  ON public.documentaries FOR SELECT
  USING (true);

CREATE POLICY "Public can view creators"
  ON public.creators FOR SELECT
  USING (true);

-- Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can manage own watch progress"
  ON public.watch_progress FOR ALL
  USING (auth.uid() = user_id);

-- Seed data matching the frontend catalog
INSERT INTO public.documentaries (title, creator_name, description, genre, year, runtime, video_url, poster_url, license) VALUES
  ('Before the Fall', 'Archival Vault', 'Iconic 1906 silent documentary shot from a cable car on Market Street, San Francisco, just days before the earthquake.', 'History', '1906', '13m', 'https://archive.org/download/SF1906TripDownMarketStreet/SF1906TripDownMarketStreet.mp4', 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?q=80&w=800&auto=format&fit=crop', 'Public Domain'),
  ('Concrete Utopia', 'New Deal Media', 'Landmark New Deal-era documentary contrasting chaotic urban congestion with planned communities. Score by Aaron Copland.', 'Urban', '1939', '43m', 'https://archive.org/download/TheCity_201505/TheCity_201505.mp4', 'https://images.unsplash.com/photo-1477959858617-67f30ac78827?q=80&w=800&auto=format&fit=crop', 'Public Domain'),
  ('Dust & Bones', 'Resettlement Docs', 'Investigative documentary chronicling the ecological disaster of the Dust Bowl.', 'Environment', '1936', '25m', 'https://archive.org/download/gov.fdr.352.2a.1/gov.fdr.352.2a.1.mp4', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop', 'Public Domain'),
  ('Shadows of War', 'John Huston', 'Documentary following WWII soldiers receiving treatment for combat-induced PTSD. Initially restricted by the U.S. Army for decades.', 'War', '1946', '58m', 'https://archive.org/download/LetThereBeLight/LetThereBeLight.mp4', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop', 'Public Domain'),
  ('Rust & Circuitry', 'Open Source Vision', 'Open-source production blending live-action documentary footage with cutting-edge visual effects.', 'Sci-Fi', '2012', '12m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop', 'Creative Commons'),
  ('The Last Search', 'Blender Institute', 'Award-winning open-source animated short exploring themes of loss, determination, and the search for meaning.', 'Animation', '2010', '15m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', 'Creative Commons'),
  ('Nature''s Revenge', 'Indie Animators', 'Classic open-source animated short demonstrating independent animation techniques.', 'Animation', '2008', '10m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop', 'Creative Commons'),
  ('Machine Mind', 'Orange Studio', 'The world''s first open-source movie, exploring themes of perception and reality.', 'Experimental', '2006', '11m', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop', 'Creative Commons');
