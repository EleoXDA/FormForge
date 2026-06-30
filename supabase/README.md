# FormForge Database Setup

## Initial Setup

1. Create a new project at [supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** in your project dashboard
3. Run the migrations in order:
   - `migrations/001_initial_schema.sql` — tables, indexes, RLS, helpers
   - `migrations/002_storage.sql` — private `form-uploads` bucket + storage RLS
   - `migrations/003_demo_seed.sql` *(optional)* — three published demo forms
4. Click **Run** for each to execute the migration

## Environment Variables

After creating your project, copy your API credentials:

1. Go to **Settings > API** in your Supabase dashboard
2. Copy the **Project URL** and **anon/public** key
3. Add them to your `.env.local` file:
```bash
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=key
```

## Tables

| Table | Purpose |
|-------|---------|
| `forms` | Form metadata (title, status, owner) |
| `form_versions` | Immutable published schemas |
| `submissions` | Form responses |

## Row Level Security

- **Forms**: Owners have full access; public can read published forms
- **Versions**: Follows form ownership; public can read published
- **Submissions**: Owners can read; public can insert to published forms
- **Storage** (`form-uploads`): public can upload via short-lived signed URLs; only authenticated owners can read; anonymous listing/reading is denied

## Demo Data

`migrations/003_demo_seed.sql` publishes three ownerless demo forms that are
publicly viewable and submittable but not editable:

| Slug | Pattern showcased |
|------|-------------------|
| `demo-job-application` | select/radio/checkbox/date + show-if logic |
| `demo-incident-report` | required fields + required-if / show-if logic |
| `demo-event-registration` | multi-step wizard + number + multiselect |

View them at `/f/<slug>` on your deployment.

## Production Readiness

Before going live, confirm:

- **RLS enabled** on `forms`, `form_versions`, `submissions`, and `storage.objects` (migrations enable this; verify under **Authentication > Policies**).
- **CORS / allowed origins**: add your deployed frontend domain under **Settings > API** so the browser client and Storage signed URLs are accepted.
- **Storage rules**: the `form-uploads` bucket is **private** with a 10 MB limit; only signed URLs grant access.
- **Secrets**: the app ships only the **publishable (anon)** key. Never expose the `service_role` key in the frontend or commit it.
- **Backups**: the Supabase free tier has limited/no automated backups — take periodic manual backups (or upgrade) for any real data.