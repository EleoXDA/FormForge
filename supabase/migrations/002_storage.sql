-- FormForge Storage Schema (Phase 9 - File uploads)
-- Run this migration in your Supabase SQL Editor after 001_initial_schema.sql
-- https://app.supabase.com/project/_/sql

-- ============================================
-- STORAGE BUCKET
-- Private bucket that holds files uploaded through public forms.
-- Files are referenced from submissions by { bucket, path } token,
-- never embedded in the submission payload.
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('form-uploads', 'form-uploads', false, 10485760) -- 10 MB
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE ROW LEVEL SECURITY
-- storage.objects has RLS enabled by default on Supabase.
-- ============================================

-- Public (anonymous) runtime may upload into the bucket only.
-- The client requests a short-lived, path-scoped signed upload URL, so each
-- upload is limited to a single object path.
CREATE POLICY "Public can upload form files"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'form-uploads');

-- Only authenticated users (form owners) may read uploaded files, e.g. when
-- reviewing submissions via short-lived signed download URLs.
-- No SELECT policy is granted to anonymous users, which also prevents
-- listing or downloading other people's uploads.
CREATE POLICY "Authenticated can read form files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'form-uploads');
