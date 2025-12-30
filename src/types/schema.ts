import type { FormField } from './fields'

/**
 * Form-level settings and configuration.
 */
export interface FormSettings {
  submitButtonText?: string
  successMessage?: string
  redirectUrl?: string
  allowMultipleSubmissions?: boolean
}

/**
 * Metadata about a form (stored separately from schema).
 */
export interface FormMeta {
  id: string
  slug: string
  title: string
  description?: string
  ownerId?: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

/**
 * Complete form schema definition.
 * This is the JSON structure that the runtime renderer consumes.
 */
export interface FormSchema {
  schemaVersion: number
  settings: FormSettings
  fields: FormField[]
}

/**
 * A published version of a form (immutable).
 */
export interface FormVersion {
  id: string
  formId: string
  version: number
  schema: FormSchema
  publishedAt: string
  publishedBy?: string
}

/**
 * A complete form document combining meta and schema.
 */
export interface FormDocument {
  meta: FormMeta
  schema: FormSchema
  currentVersion?: number
}

/**
 * Form submission payload.
 */
export interface FormSubmission {
  id: string
  formId: string
  schemaVersion: number
  answers: Record<string, unknown>
  submittedAt: string
  metadata?: {
    userAgent?: string
    locale?: string
  }
}