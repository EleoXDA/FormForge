import { v4 as uuidv4 } from 'uuid'
import type { FormField, FieldType, FormSchema } from '@/types'

/**
 * Generates a unique field ID.
 */
export function generateFieldId(): string {
  return `field_${uuidv4().slice(0, 8)}`
}

/**
 * Generates a unique form ID.
 */
export function generateFormId(): string {
  return `form_${uuidv4().slice(0, 8)}`
}

/**
 * Creates a default field definition based on type.
 */
export function createDefaultField(type: FieldType): FormField {
  const base = {
    id: generateFieldId(),
    name: '',
    label: '',
    required: false
  }

  switch (type) {
    case 'text':
      return { ...base, type: 'text' }
    case 'email':
      return { ...base, type: 'email', label: 'Email' }
    case 'number':
      return { ...base, type: 'number' }
    case 'textarea':
      return { ...base, type: 'textarea', rows: 4 }
    case 'select':
      return { ...base, type: 'select', options: [{ value: 'option1', label: 'Option 1' }] }
    case 'multiselect':
      return { ...base, type: 'multiselect', options: [{ value: 'option1', label: 'Option 1' }] }
    case 'checkbox':
      return { ...base, type: 'checkbox' }
    case 'radio':
      return { ...base, type: 'radio', options: [{ value: 'option1', label: 'Option 1' }] }
    case 'date':
      return { ...base, type: 'date' }
    case 'phone':
      return { ...base, type: 'phone', label: 'Phone' }
    default:
      return { ...base, type: 'text' }
  }
}

/**
 * Creates an empty form schema.
 */
export function createEmptySchema(): FormSchema {
  return {
    schemaVersion: 1,
    settings: {
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!'
    },
    fields: []
  }
}

/**
 * Finds a field by ID in a schema.
 */
export function findFieldById(schema: FormSchema, fieldId: string): FormField | undefined {
  return schema.fields.find((f) => f.id === fieldId)
}

/**
 * Updates a field in a schema by ID (immutable).
 */
export function updateFieldInSchema(
  schema: FormSchema,
  fieldId: string,
  updates: Partial<FormField>
): FormSchema {
  return {
    ...schema,
    fields: schema.fields.map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field
    ) as FormField[]
  }
}

/**
 * Removes a field from schema by ID (immutable).
 */
export function removeFieldFromSchema(schema: FormSchema, fieldId: string): FormSchema {
  return {
    ...schema,
    fields: schema.fields.filter((f) => f.id !== fieldId)
  }
}