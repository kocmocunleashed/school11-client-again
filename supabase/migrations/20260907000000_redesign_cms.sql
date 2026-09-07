-- Additive: keep all original tables, APIs, IDs and storage buckets intact.
ALTER TABLE public.school_settings ADD COLUMN IF NOT EXISTS hero_image_url text;
ALTER TABLE public.school_settings ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.school_settings ADD COLUMN IF NOT EXISTS site_copy jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS public.hall_of_fame (
 id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 160),
 scope text NOT NULL CHECK (scope IN ('international','national')),
 photo text,
 medals jsonb NOT NULL CHECK (jsonb_typeof(medals) = 'array' AND jsonb_array_length(medals) BETWEEN 1 AND 100),
 is_published boolean NOT NULL DEFAULT false,
 is_featured boolean NOT NULL DEFAULT false,
 display_order integer NOT NULL DEFAULT 0 CHECK (display_order BETWEEN 0 AND 10000),
 source_url text,
 source_record_id text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published medalists" ON public.hall_of_fame;
CREATE POLICY "Public read published medalists" ON public.hall_of_fame FOR SELECT TO anon, authenticated USING (is_published = true);
GRANT SELECT ON public.hall_of_fame TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.hall_of_fame FROM anon, authenticated;
GRANT ALL ON public.hall_of_fame TO service_role;
CREATE INDEX IF NOT EXISTS hall_of_fame_public_order ON public.hall_of_fame (is_published, display_order);
