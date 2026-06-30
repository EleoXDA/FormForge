# FormForge

> A schema-driven, low-code form builder built with Vue 3, TypeScript, and Quasar.

[![CI](https://github.com/EleoXDA/formforge/actions/workflows/ci.yml/badge.svg)](https://github.com/EleoXDA/formforge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Highlights

- **Schema-First Architecture**: Forms are defined as JSON schemas, enabling version control, validation, and deterministic rendering
- **Visual Drag-and-Drop Builder**: Intuitive interface for creating forms without writing code
- **Type-Safe Runtime**: Zod validators ensure schema integrity at runtime, catching errors before they reach users
- **Undo/Redo System**: Full history tracking with keyboard shortcuts (Ctrl+Z/Y)
- **Conditional Logic**: Per-field show/require/disable rules evaluated deterministically at runtime
- **Multi-Step Wizards**: Split forms into validated steps with Next/Back navigation and saved local progress
- **File Uploads**: Optional file field backed by Supabase Storage with signed upload URLs, type/size limits, and progress
- **11 Field Types**: Text, email, number, phone, textarea, select, multiselect, checkbox, radio, date, file

## Demo

🔗 **[Live Demo](https://formforge-demo.netlify.app)** *(coming soon)*

Try the published demo forms (after running the demo seed):
- `/f/demo-job-application` — conditional logic (portfolio shows for designers)
- `/f/demo-incident-report` — required-if logic (injury details appear when someone was injured)
- `/f/demo-event-registration` — multi-step wizard

> No login is required to view or submit the demo forms. The builder dashboard requires a Supabase-authenticated session.

![FormForge Builder Screenshot](docs/screenshot-builder.png)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3 with Composition API |
| Language | TypeScript (strict mode) |
| UI Components | Quasar Framework |
| State Management | Pinia with persistence |
| Drag & Drop | VueDraggable (SortableJS) |
| Validation | Zod + VeeValidate |
| Backend | Supabase (PostgreSQL) |
| Unit/Component Testing | Vitest + Vue Test Utils |
| E2E Testing | Playwright |
| CI/CD | GitHub Actions |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/formforge.git
cd formforge

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with your Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

See [supabase/README.md](supabase/README.md) for database setup instructions.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Architecture

FormForge follows a **schema-driven UI** pattern where the form schema (JSON) is the single source of truth:
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Form Builder   │────▶│   JSON Schema    │────▶│ Runtime Renderer│
│  (Visual Editor)│     │  (Source of Truth)│     │  (End User Form)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Key Design Decisions

1. **Discriminated Union Types**: Field types use TypeScript's discriminated unions, enabling type narrowing based on the `type` property
2. **Immutable Schema Updates**: All schema modifications create new objects, enabling reliable undo/redo
3. **Separation of Builder and Runtime**: The renderer can operate independently, making it suitable for embedding or extraction as a library
4. **Zod Validation at Boundaries**: Schemas are validated when loaded from external sources (database, API)

### Schema Versioning

- Every publish writes a **new, immutable** `form_versions` row (the `version` increments via the `get_next_version` SQL helper).
- The public runner loads the **latest published** version by slug, or a pinned one via `/f/:slug/v/:version`.
- Each submission stores the exact `schema_version` it was captured against, so responses always map back to the schema the respondent actually saw.

### Directory Structure
```
src/
├── components/
│   ├── builder/          # Visual editor components
│   │   ├── inspector/    # Property editing panels
│   │   └── ...
│   └── runtime/          # Form rendering components
│       └── fields/       # Individual field renderers
├── composables/          # Reusable composition functions
├── services/             # API and external services
├── stores/               # Pinia state management
├── types/                # TypeScript interfaces + Zod schemas
├── utils/                # Helper functions
└── views/                # Page components
```

## How to Evaluate This Repo

**Start here:**
- `src/types/fields.ts` - Core type definitions with discriminated unions
- `src/stores/formEditorStore.ts` - State management with undo/redo
- `src/components/runtime/SchemaRenderer.vue` - Dynamic form rendering

**Key tests:**
- `src/utils/schema.test.ts` - Schema utility coverage
- `src/utils/logic.test.ts` - Conditional logic evaluator coverage
- `src/stores/formEditorStore.test.ts` - Store action testing
- `src/components/runtime/fields/fieldRenderers.test.ts` - Field renderer component tests
- `src/test/fixtures.test.ts` - Regression fixtures (sample schemas in `fixtures/`)
- `e2e/` - Playwright end-to-end flows (builder demo + runtime render/validate/submit)

**Architecture docs:**
- [supabase/README.md](supabase/README.md) - Database schema and RLS policies

## Observability

- Structured frontend logging via a single `logger` utility (`src/utils/logger.ts`) with `debug`/`info`/`warn`/`error` levels and a typed `LogEntry` shape.
- Key product events are recorded with `logger.event(...)` — currently `form_published` (builder) and `form_submitted` (runtime) — making them easy to filter and forward to a remote sink later.
- Quiet in production (warnings/errors only) and verbose in development. Service-layer errors flow through the logger instead of bare `console` calls.

## Performance

- **Debounced autosave**: builder changes are persisted on a 3s debounce (`useAutoSave`) rather than on every keystroke.
- **Shallow history**: undo/redo snapshots are stored with `markRaw` so large schema trees don't incur deep-reactivity overhead; the live editing copy is re-cloned on restore to stay reactive.
- **Paginated + virtualized submissions**: the submissions table loads one page at a time from the server (constant memory) and virtualizes the rendered rows.

## Security

- **No `eval` / `new Function`**: conditional logic is evaluated by a deterministic interpreter (`src/utils/logic.ts`), never by evaluating strings.
- **Secrets only on the server**: the client uses the Supabase *publishable* (anon) key only; no service-role key is shipped to the browser.
- **Row Level Security**: builder writes require an authenticated owner; the public runtime can only read published versions and insert submissions. File uploads use short-lived, path-scoped signed URLs against a private bucket (no listing). See [supabase/migrations](supabase/migrations).
- **Public submission abuse**: submissions are insert-only under RLS and the UI guards against double-submit. For production, add edge rate-limiting per IP/form.

## Accessibility

- Field labels are associated with their inputs by the runtime field renderers.
- On a failed submit the runtime shows a `role="alert"` **error summary** that lists each invalid field as a link which scrolls to and focuses the control.
- The builder supports keyboard shortcuts (undo/redo, delete, duplicate) via `useBuilderKeyboard`.

## Deployment

FormForge is a single SPA that serves both the builder and the public form runner, deployed to **Netlify** with a **Supabase** backend.

**Netlify** (config in [netlify.toml](netlify.toml)):
- Build command `npm run build`, publish directory `dist`.
- SPA history fallback (`/* → /index.html`) so deep links like `/f/:slug` work on refresh.
- Framing is intentionally allowed so embedded forms render inside third-party `<iframe>`s.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under **Site settings → Environment variables**.

**Supabase**: run the migrations in [supabase/migrations](supabase/migrations) (schema, storage, optional demo seed) and confirm the production checklist in [supabase/README.md](supabase/README.md).

Pushing to `main` triggers a production deploy; pull requests get Netlify deploy previews.

## Known Limitations

- **No authentication UI**: Auth is set up in Supabase but no login flow in the app yet

## Roadmap

- [x] Conditional logic engine (show/hide, required-if, disable-if)
- [x] Multi-step wizard forms
- [x] File uploads (Supabase Storage)
- [ ] Form analytics dashboard
- [ ] Embeddable JS widget (beyond iframe)
- [ ] Custom theming system

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a PR.

## License

MIT © [Your Name]
