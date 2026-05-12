-- Artists directory
CREATE TABLE public.artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  members text,
  from_city text,
  based_city text,
  genres text[] NOT NULL DEFAULT '{}',
  bio text,
  photo_url text,
  instagram text,
  soundcloud text,
  bandcamp text,
  spotify text,
  website text,
  booking_email text,
  manager_email text,
  festivals text[] NOT NULL DEFAULT '{}',
  labels text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  source text NOT NULL DEFAULT 'seed' CHECK (source IN ('seed','submission','scrape','manual')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read approved artists" ON public.artists
  FOR SELECT USING (status = 'approved');
CREATE TRIGGER artists_updated_at
  BEFORE UPDATE ON public.artists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX artists_status_idx ON public.artists(status);
CREATE INDEX artists_genres_idx ON public.artists USING GIN(genres);

-- Public submissions
CREATE TABLE public.artist_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  members text,
  from_city text,
  based_city text,
  genres text[] NOT NULL DEFAULT '{}',
  bio text,
  photo_url text,
  instagram text,
  soundcloud text,
  bandcamp text,
  spotify text,
  website text,
  booking_email text,
  manager_email text,
  festivals text[] NOT NULL DEFAULT '{}',
  labels text,
  submitter_email text NOT NULL,
  submitter_role text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.artist_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit artists" ON public.artist_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Booking requests
CREATE TABLE public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES public.artists(id) ON DELETE SET NULL,
  artist_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  purpose text,
  verified_at timestamptz,
  revealed_at timestamptz,
  forward_requested boolean NOT NULL DEFAULT false,
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
-- no policies: service role only

-- OTP codes
CREATE TABLE public.booking_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_otp_codes ENABLE ROW LEVEL SECURITY;
CREATE INDEX booking_otp_codes_email_idx ON public.booking_otp_codes(email, created_at DESC);
-- no policies: service role only

-- Storage bucket for artist photos
INSERT INTO storage.buckets (id, name, public)
  VALUES ('artist-photos', 'artist-photos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read artist photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artist-photos');

CREATE POLICY "Anyone can upload artist photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'artist-photos');