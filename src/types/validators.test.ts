import { describe, it, expect } from 'vitest'
import {
  validateFormSchema,
  formFieldSchema,
  fieldOptionSchema,
  formSettingsSchema
} from './validators'
import type { FormSchema } from './schema'

describe('Zod validators', () => {
  describe('fieldOptionSchema', () => {
    it('validates a correct option', () => {
      const result = fieldOptionSchema.safeParse({
        value: 'test',
        label: 'Test Label'
      })
      
      expect(result.success).toBe(true)
    })

    it('rejects an option with empty value', () => {
      const result = fieldOptionSchema.safeParse({
        value: '',
        label: 'Test'
      })
      
      expect(result.success).toBe(false)
    })

    it('rejects an option with empty label', () => {
      const result = fieldOptionSchema.safeParse({
        value: 'test',
        label: ''
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('formFieldSchema', () => {
    it('validates a text field', () => {
      const result = formFieldSchema.safeParse({
        id: 'field_1',
        type: 'text',
        name: 'username',
        label: 'Username'
      })
      
      expect(result.success).toBe(true)
    })

    it('validates a text field with validation rules', () => {
      const result = formFieldSchema.safeParse({
        id: 'field_1',
        type: 'text',
        name: 'username',
        label: 'Username',
        validation: {
          minLength: 3,
          maxLength: 20
        }
      })
      
      expect(result.success).toBe(true)
    })

    it('validates a select field with options', () => {
      const result = formFieldSchema.safeParse({
        id: 'field_1',
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' }
        ]
      })
      
      expect(result.success).toBe(true)
    })

    it('rejects a select field without options', () => {
      const result = formFieldSchema.safeParse({
        id: 'field_1',
        type: 'select',
        name: 'country',
        label: 'Country',
        options: []
      })
      
      expect(result.success).toBe(false)
    })

    it('validates a number field with min/max', () => {
      const result = formFieldSchema.safeParse({
        id: 'field_1',
        type: 'number',
        name: 'age',
        label: 'Age',
        validation: {
          min: 0,
          max: 120
        }
      })
      
      expect(result.success).toBe(true)
    })

    it('rejects a field with empty ID', () => {
      const result = formFieldSchema.safeParse({
        id: '',
        type: 'text',
        name: 'test',
        label: 'Test'
      })
      
      expect(result.success).toBe(false)
    })

    it('rejects an unknown field type', () => {
      const result = formFieldSchema.safeParse({
        id: 'field_1',
        type: 'unknown_type',
        name: 'test',
        label: 'Test'
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('formSettingsSchema', () => {
    it('validates empty settings', () => {
      const result = formSettingsSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('validates complete settings', () => {
      const result = formSettingsSchema.safeParse({
        submitButtonText: 'Send',
        successMessage: 'Thanks!',
        redirectUrl: 'https://example.com',
        allowMultipleSubmissions: true
      })
      
      expect(result.success).toBe(true)
    })

    it('rejects invalid redirect URL', () => {
      const result = formSettingsSchema.safeParse({
        redirectUrl: 'not-a-url'
      })
      
      expect(result.success).toBe(false)
    })
  })

  describe('validateFormSchema', () => {
    it('validates a complete valid schema', () => {
      const schema: FormSchema = {
        schemaVersion: 1,
        settings: {
          submitButtonText: 'Submit',
          successMessage: 'Thank you!'
        },
        fields: [
          {
            id: 'field_1',
            type: 'text',
            name: 'name',
            label: 'Full Name',
            required: true
          },
          {
            id: 'field_2',
            type: 'email',
            name: 'email',
            label: 'Email Address'
          }
        ]
      }

      const result = validateFormSchema(schema)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.fields).toHaveLength(2)
      }
    })

    it('validates a schema with no fields', () => {
      const schema: FormSchema = {
        schemaVersion: 1,
        settings: {},
        fields: []
      }

      const result = validateFormSchema(schema)
      expect(result.success).toBe(true)
    })

    it('rejects a schema with invalid schemaVersion', () => {
      const result = validateFormSchema({
        schemaVersion: 0,
        settings: {},
        fields: []
      })
      
      expect(result.success).toBe(false)
    })

    it('rejects a schema with invalid field', () => {
      const result = validateFormSchema({
        schemaVersion: 1,
        settings: {},
        fields: [
          {
            id: 'field_1',
            type: 'invalid',
            name: 'test',
            label: 'Test'
          }
        ]
      })
      
      expect(result.success).toBe(false)
    })

    it('provides error details for invalid input', () => {
      const result = validateFormSchema({
        schemaVersion: 'not a number',
        settings: {},
        fields: []
      })
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toBeDefined()
      }
    })
  })
})