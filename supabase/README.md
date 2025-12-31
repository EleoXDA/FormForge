# FormForge Database Setup

## Initial Setup

1. Create a new project at [supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** in your project dashboard
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click **Run** to execute the migration

## Environment Variables

After creating your project, copy your API credentials:

1. Go to **Settings > API** in your Supabase dashboard
2. Copy the **Project URL** and **anon/public** key
3. Add them to your `.env.local` file:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
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