-- FormForge Database Schema
-- Run this migration in your Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- ============================================
-- FORMS TABLE
-- Stores form metadata (title, status, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Form',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by slug (used in public URLs)
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);

-- Index for listing forms by owner
CREATE INDEX IF NOT EXISTS idx_forms_owner ON forms(owner_id);

-- ============================================
-- FORM VERSIONS TABLE
-- Stores immutable published versions of form schemas
-- Each publish creates a new version record
-- ============================================
CREATE TABLE IF NOT EXISTS form_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  schema JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Ensure version numbers are unique per form
  UNIQUE(form_id, version)
);

-- Index for fetching latest version
CREATE INDEX IF NOT EXISTS idx_form_versions_form ON form_versions(form_id, version DESC);

-- ============================================
-- SUBMISSIONS TABLE
-- Stores form responses from end users
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  schema_version INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Optional metadata for analytics
  user_agent TEXT,
  ip_address INET,
  locale TEXT
);

-- Index for listing submissions by form
CREATE INDEX IF NOT EXISTS idx_submissions_form ON submissions(form_id, submitted_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Protect data access based on authentication
-- ============================================

-- Enable RLS on all tables
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Forms: owners can do everything, public can read published forms
CREATE POLICY "Owners can manage their forms"
  ON forms FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Public can read published forms by slug"
  ON forms FOR SELECT
  USING (status = 'published');

-- Form Versions: owners can manage, public can read published
CREATE POLICY "Owners can manage form versions"
  ON form_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_versions.form_id 
      AND forms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can read published form versions"
  ON form_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = form_versions.form_id 
      AND forms.status = 'published'
    )
  );

-- Submissions: owners can read, public can insert
CREATE POLICY "Owners can read their form submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = submissions.form_id 
      AND forms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can submit to published forms"
  ON submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms 
      WHERE forms.id = submissions.form_id 
      AND forms.status = 'published'
    )
  );

-- ============================================
-- FUNCTIONS
-- Helper functions for common operations
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on forms
CREATE TRIGGER forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to get the next version number for a form
CREATE OR REPLACE FUNCTION get_next_version(p_form_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT MAX(version) + 1 FROM form_versions WHERE form_id = p_form_id),
    1
  );
END;
$$ LANGUAGE plpgsql;