
ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS insights jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS insights_generated_at timestamptz;
