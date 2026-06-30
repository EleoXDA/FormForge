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
- **10 Field Types**: Text, email, number, phone, textarea, select, multiselect, checkbox, radio, date

## Demo

🔗 **[Live Demo](https://formforge-demo.netlify.app)** *(coming soon)*

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
| Testing | Vitest + Vue Test Utils |
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

**Architecture docs:**
- [supabase/README.md](supabase/README.md) - Database schema and RLS policies

## Known Limitations

- **No authentication UI**: Auth is set up in Supabase but no login flow in the app yet
- **No file uploads**: File field type is intentionally deferred

## Roadmap

- [x] Conditional logic engine (show/hide, required-if, disable-if)
- [x] Multi-step wizard forms
- [ ] Form analytics dashboard
- [ ] Embeddable JS widget (beyond iframe)
- [ ] Custom theming system

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a PR.

## License

MIT © [Your Name]
