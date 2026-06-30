-- FormForge Demo Seed (Phase 12 - Public demo data)
-- OPTIONAL: run this in your Supabase SQL Editor after 001_initial_schema.sql
-- to publish three demo forms that showcase different patterns.
--
-- These forms have no owner (owner_id IS NULL), so they are publicly readable
-- and submittable (per RLS) but cannot be edited from the builder. They use
-- fixed UUIDs and ON CONFLICT guards, so this script is safe to re-run.
--
-- Public URLs (replace with your deployed domain):
--   /f/demo-job-application
--   /f/demo-incident-report
--   /f/demo-event-registration

-- ============================================
-- 1) Job Application — selection, radio, checkbox, date + conditional logic
-- ============================================
INSERT INTO forms (id, slug, title, description, status)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo-job-application',
  'Job Application',
  'Apply for an open engineering or design role.',
  'published'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO form_versions (form_id, version, schema)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  1,
  $json$
  {
    "schemaVersion": 1,
    "settings": { "submitButtonText": "Apply", "successMessage": "Application received. We'll be in touch." },
    "fields": [
      { "id": "ja_name", "type": "text", "name": "full_name", "label": "Full Name", "required": true },
      { "id": "ja_email", "type": "email", "name": "email", "label": "Email", "required": true },
      { "id": "ja_phone", "type": "phone", "name": "phone", "label": "Phone" },
      { "id": "ja_role", "type": "select", "name": "role", "label": "Role", "required": true,
        "options": [
          { "value": "frontend", "label": "Frontend Engineer" },
          { "value": "backend", "label": "Backend Engineer" },
          { "value": "design", "label": "Designer" }
        ] },
      { "id": "ja_exp", "type": "radio", "name": "experience", "label": "Years of experience", "required": true,
        "options": [
          { "value": "junior", "label": "0-2 years" },
          { "value": "mid", "label": "3-5 years" },
          { "value": "senior", "label": "6+ years" }
        ] },
      { "id": "ja_portfolio", "type": "text", "name": "portfolio_url", "label": "Portfolio URL",
        "helpText": "Shown when applying for a design role",
        "logic": { "showIf": { "combinator": "and", "conditions": [ { "field": "ja_role", "operator": "equals", "value": "design" } ] } } },
      { "id": "ja_skills", "type": "checkbox", "name": "skills", "label": "Skills",
        "options": [
          { "value": "ts", "label": "TypeScript" },
          { "value": "vue", "label": "Vue" },
          { "value": "sql", "label": "SQL" }
        ] },
      { "id": "ja_start", "type": "date", "name": "start_date", "label": "Available from" }
    ]
  }
  $json$::jsonb
)
ON CONFLICT (form_id, version) DO NOTHING;

-- ============================================
-- 2) Incident Report — required fields + required-if / show-if logic
-- ============================================
INSERT INTO forms (id, slug, title, description, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'demo-incident-report',
  'Incident Report',
  'Report a workplace safety incident.',
  'published'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO form_versions (form_id, version, schema)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  1,
  $json$
  {
    "schemaVersion": 1,
    "settings": { "submitButtonText": "Submit Report", "successMessage": "Your incident report has been logged." },
    "fields": [
      { "id": "ir_reporter", "type": "text", "name": "reporter_name", "label": "Reporter Name", "required": true },
      { "id": "ir_date", "type": "date", "name": "incident_date", "label": "Date of Incident", "required": true },
      { "id": "ir_location", "type": "text", "name": "location", "label": "Location", "required": true },
      { "id": "ir_severity", "type": "select", "name": "severity", "label": "Severity", "required": true,
        "options": [
          { "value": "low", "label": "Low" },
          { "value": "medium", "label": "Medium" },
          { "value": "high", "label": "High" },
          { "value": "critical", "label": "Critical" }
        ] },
      { "id": "ir_injured", "type": "radio", "name": "anyone_injured", "label": "Was anyone injured?", "required": true,
        "options": [
          { "value": "no", "label": "No" },
          { "value": "yes", "label": "Yes" }
        ] },
      { "id": "ir_injury", "type": "textarea", "name": "injury_details", "label": "Injury details",
        "helpText": "Describe injuries and any first aid given",
        "logic": {
          "showIf": { "combinator": "and", "conditions": [ { "field": "ir_injured", "operator": "equals", "value": "yes" } ] },
          "requiredIf": { "combinator": "and", "conditions": [ { "field": "ir_injured", "operator": "equals", "value": "yes" } ] }
        } },
      { "id": "ir_desc", "type": "textarea", "name": "description", "label": "What happened?", "required": true,
        "validation": { "maxLength": 2000 } }
    ]
  }
  $json$::jsonb
)
ON CONFLICT (form_id, version) DO NOTHING;

-- ============================================
-- 3) Event Registration — multi-step wizard with number + multiselect
-- ============================================
INSERT INTO forms (id, slug, title, description, status)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'demo-event-registration',
  'Event Registration',
  'Register for the FormForge conference.',
  'published'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO form_versions (form_id, version, schema)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  1,
  $json$
  {
    "schemaVersion": 1,
    "settings": { "submitButtonText": "Register", "successMessage": "You're registered. See you there!" },
    "steps": [
      { "id": "step_attendee", "title": "Attendee", "description": "Tell us about yourself" },
      { "id": "step_preferences", "title": "Preferences" }
    ],
    "fields": [
      { "id": "er_name", "type": "text", "name": "full_name", "label": "Full Name", "required": true, "stepId": "step_attendee" },
      { "id": "er_email", "type": "email", "name": "email", "label": "Email", "required": true, "stepId": "step_attendee" },
      { "id": "er_guests", "type": "number", "name": "guests", "label": "Number of guests", "validation": { "min": 0, "max": 10 }, "stepId": "step_attendee" },
      { "id": "er_tracks", "type": "multiselect", "name": "tracks", "label": "Tracks of interest", "required": true,
        "options": [
          { "value": "ai", "label": "AI" },
          { "value": "web", "label": "Web" },
          { "value": "cloud", "label": "Cloud" }
        ], "stepId": "step_preferences" },
      { "id": "er_meal", "type": "select", "name": "meal", "label": "Meal preference",
        "options": [
          { "value": "veg", "label": "Vegetarian" },
          { "value": "non_veg", "label": "Non-vegetarian" }
        ], "stepId": "step_preferences" }
    ]
  }
  $json$::jsonb
)
ON CONFLICT (form_id, version) DO NOTHING;
