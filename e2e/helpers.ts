import type { Page } from '@playwright/test'

/**
 * localStorage key used by the persisted form-editor Pinia store
 * (see `persist.key` in src/stores/formEditorStore.ts).
 */
export const EDITOR_STORAGE_KEY = 'formforge-editor'

interface SeedOption {
  value: string
  label: string
}

interface SeedField {
  id: string
  type: string
  name: string
  label: string
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: SeedOption[]
}

interface SeedForm {
  meta: {
    id: string
    slug: string
    title: string
    status: string
    createdAt: string
    updatedAt: string
  }
  schema: {
    schemaVersion: number
    settings: Record<string, unknown>
    fields: SeedField[]
  }
  isDirty: boolean
}

/**
 * A small contact form used by the demo-mode E2E flows. The id is `demo`
 * so both /builder/demo and /preview/demo pick it up from the store.
 */
export function contactForm(): SeedForm {
  const now = '2026-01-01T00:00:00.000Z'
  return {
    meta: {
      id: 'demo',
      slug: 'demo',
      title: 'Contact Us',
      status: 'draft',
      createdAt: now,
      updatedAt: now
    },
    schema: {
      schemaVersion: 1,
      settings: { submitButtonText: 'Send', successMessage: 'Thanks for reaching out!' },
      fields: [
        { id: 'f_name', type: 'text', name: 'full_name', label: 'Full Name', required: true },
        { id: 'f_email', type: 'email', name: 'email', label: 'Email Address', required: true },
        { id: 'f_message', type: 'textarea', name: 'message', label: 'Message' }
      ]
    },
    isDirty: false
  }
}

/**
 * Seed the persisted editor store before the app boots, so the builder and
 * preview render a known form deterministically (no drag-and-drop, no backend).
 */
export async function seedEditorForm(page: Page, form: SeedForm): Promise<void> {
  await page.addInitScript(
    (data: { key: string; value: string }) => {
      window.localStorage.setItem(data.key, data.value)
    },
    { key: EDITOR_STORAGE_KEY, value: JSON.stringify(form) }
  )
}

/**
 * Fill a Quasar input/textarea by the visible label of its field wrapper.
 */
export async function fillFieldByLabel(page: Page, label: string, value: string): Promise<void> {
  await page
    .locator('.q-field', { hasText: label })
    .locator('input, textarea')
    .first()
    .fill(value)
}
