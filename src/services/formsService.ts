import { supabase } from './supabase'
import type { FormMeta, FormSchema, FormDocument, FormSubmission } from '@/types'

/**
 * Database row types (what Supabase returns)
 */
interface FormRow {
  id: string
  slug: string
  title: string
  description: string | null
  status: 'draft' | 'published' | 'archived'
  owner_id: string | null
  created_at: string
  updated_at: string
}

// interface FormVersionRow {
//   id: string
//   form_id: string
//   version: number
//   schema: FormSchema
//   published_at: string
//   published_by: string | null
// }

interface SubmissionRow {
  id: string
  form_id: string
  schema_version: number
  answers: Record<string, unknown>
  submitted_at: string
  user_agent: string | null
  ip_address: string | null
  locale: string | null
}

/**
 * Service result type for consistent error handling
 */
export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Transform a database row to our FormMeta type
 */
function rowToFormMeta(row: FormRow): FormMeta {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    ownerId: row.owner_id ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

/**
 * Forms Service
 * Handles all database operations for forms, versions, and submissions
 */
export const formsService = {
  /**
   * Get all forms (for the current user or all if no auth)
   */
  async getAllForms(): Promise<ServiceResult<FormMeta[]>> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: (data as FormRow[]).map(rowToFormMeta)
      }
    } catch (err) {
      console.error('Failed to fetch forms:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch forms'
      }
    }
  },

  /**
   * Get a single form by ID with its latest schema
   */
  async getFormById(formId: string): Promise<ServiceResult<FormDocument>> {
    try {
      // Fetch form metadata
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single()

      if (formError) throw formError

      // Fetch the latest version's schema
      const { data: versionData, error: versionError } = await supabase
        .from('form_versions')
        .select('version, schema')
        .eq('form_id', formId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (versionError) throw versionError

      const meta = rowToFormMeta(formData as FormRow)
      
      // If no version exists, return with default empty schema
      const schema: FormSchema = versionData?.schema ?? {
        schemaVersion: 1,
        settings: {
          submitButtonText: 'Submit',
          successMessage: 'Thank you for your submission!'
        },
        fields: []
      }

      return {
        success: true,
        data: {
          meta,
          schema,
          currentVersion: versionData?.version
        }
      }
    } catch (err) {
      console.error('Failed to fetch form:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch form'
      }
    }
  },

  /**
   * Get a form by its public slug
   */
  async getFormBySlug(slug: string): Promise<ServiceResult<FormDocument>> {
    try {
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (formError) throw formError

      // Get latest published version
      const { data: versionData, error: versionError } = await supabase
        .from('form_versions')
        .select('version, schema')
        .eq('form_id', formData.id)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (versionError) throw versionError

      return {
        success: true,
        data: {
          meta: rowToFormMeta(formData as FormRow),
          schema: versionData.schema,
          currentVersion: versionData.version
        }
      }
    } catch (err) {
      console.error('Failed to fetch form by slug:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Form not found'
      }
    }
  },

  /**
   * Create a new form
   */
  async createForm(title: string): Promise<ServiceResult<FormMeta>> {
    try {
      // Generate a unique slug from title
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const slug = `${baseSlug}-${Date.now().toString(36)}`

      const { data, error } = await supabase
        .from('forms')
        .insert({ title, slug })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: rowToFormMeta(data as FormRow)
      }
    } catch (err) {
      console.error('Failed to create form:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create form'
      }
    }
  },

  /**
   * Update form metadata
   */
  async updateForm(
    formId: string, 
    updates: Partial<Pick<FormMeta, 'title' | 'description' | 'status'>>
  ): Promise<ServiceResult<FormMeta>> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .update(updates)
        .eq('id', formId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: rowToFormMeta(data as FormRow)
      }
    } catch (err) {
      console.error('Failed to update form:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update form'
      }
    }
  },

  /**
   * Save a new version of the form schema
   */
  async saveVersion(formId: string, schema: FormSchema): Promise<ServiceResult<number>> {
    try {
      // Get next version number using the database function
      const { data: versionNum, error: versionError } = await supabase
        .rpc('get_next_version', { p_form_id: formId })

      if (versionError) throw versionError

      // Insert the new version
      const { error: insertError } = await supabase
        .from('form_versions')
        .insert({
          form_id: formId,
          version: versionNum,
          schema
        })

      if (insertError) throw insertError

      return {
        success: true,
        data: versionNum as number
      }
    } catch (err) {
      console.error('Failed to save version:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save version'
      }
    }
  },

  /**
   * Delete a form and all its versions/submissions
   */
  async deleteForm(formId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId)

      if (error) throw error

      return { success: true, data: undefined }
    } catch (err) {
      console.error('Failed to delete form:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete form'
      }
    }
  },

  /**
   * Submit a form response
   */
  async submitResponse(
    formId: string,
    schemaVersion: number,
    answers: Record<string, unknown>
  ): Promise<ServiceResult<string>> {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          form_id: formId,
          schema_version: schemaVersion,
          answers,
          user_agent: navigator.userAgent,
          locale: navigator.language
        })
        .select('id')
        .single()

      if (error) throw error

      return {
        success: true,
        data: data.id
      }
    } catch (err) {
      console.error('Failed to submit response:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to submit response'
      }
    }
  },

  /**
   * Get all submissions for a form
   */
  async getSubmissions(
    formId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<ServiceResult<{ submissions: FormSubmission[]; total: number }>> {
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId)

      if (countError) throw countError

      // Get paginated submissions
      let query = supabase
        .from('submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false })

      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      const submissions: FormSubmission[] = (data as SubmissionRow[]).map((row) => ({
        id: row.id,
        formId: row.form_id,
        schemaVersion: row.schema_version,
        answers: row.answers,
        submittedAt: row.submitted_at,
        metadata: {
          userAgent: row.user_agent ?? undefined,
          locale: row.locale ?? undefined
        }
      }))

      return {
        success: true,
        data: {
          submissions,
          total: count ?? 0
        }
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fetch submissions'
      }
    }
  }
}