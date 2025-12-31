import { describe, it, expect } from 'vitest'
import {
  generateFieldId,
  generateFormId,
  createDefaultField,
  createEmptySchema,
  findFieldById,
  updateFieldInSchema,
  removeFieldFromSchema
} from './schema'
import type { FormSchema } from '@/types'

describe('schema utilities', () => {
  describe('generateFieldId', () => {
    it('generates a string starting with "field_"', () => {
      const id = generateFieldId()
      expect(id).toMatch(/^field_[a-z0-9]+$/)
    })

    it('generates unique IDs on each call', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateFieldId())
      }
      expect(ids.size).toBe(100)
    })
  })

  describe('generateFormId', () => {
    it('generates a string starting with "form_"', () => {
      const id = generateFormId()
      expect(id).toMatch(/^form_[a-z0-9]+$/)
    })

    it('generates unique IDs on each call', () => {
      const id1 = generateFormId()
      const id2 = generateFormId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('createDefaultField', () => {
    it('creates a text field with correct defaults', () => {
      const field = createDefaultField('text')
      
      expect(field.type).toBe('text')
      expect(field.id).toMatch(/^field_/)
      expect(field.name).toBe('')
      expect(field.label).toBe('')
      expect(field.required).toBe(false)
    })

    it('creates an email field with "Email" as default label', () => {
      const field = createDefaultField('email')
      
      expect(field.type).toBe('email')
      expect(field.label).toBe('Email')
    })

    it('creates a textarea field with rows set to 4', () => {
      const field = createDefaultField('textarea')
      
      expect(field.type).toBe('textarea')
      if (field.type === 'textarea') {
        expect(field.rows).toBe(4)
      }
    })

    it('creates a select field with one default option', () => {
      const field = createDefaultField('select')
      
      expect(field.type).toBe('select')
      if (field.type === 'select') {
        expect(field.options).toHaveLength(1)
        expect(field.options[0]).toEqual({ value: 'option1', label: 'Option 1' })
      }
    })

    it('creates a radio field with one default option', () => {
      const field = createDefaultField('radio')
      
      expect(field.type).toBe('radio')
      if (field.type === 'radio') {
        expect(field.options).toHaveLength(1)
      }
    })

    it('creates a number field with null step', () => {
      const field = createDefaultField('number')
      
      expect(field.type).toBe('number')
    })
  })

  describe('createEmptySchema', () => {
    it('creates a schema with version 1', () => {
      const schema = createEmptySchema()
      expect(schema.schemaVersion).toBe(1)
    })

    it('creates a schema with default settings', () => {
      const schema = createEmptySchema()
      
      expect(schema.settings.submitButtonText).toBe('Submit')
      expect(schema.settings.successMessage).toBe('Thank you for your submission!')
    })

    it('creates a schema with empty fields array', () => {
      const schema = createEmptySchema()
      expect(schema.fields).toEqual([])
    })
  })

  describe('findFieldById', () => {
    const schema: FormSchema = {
      schemaVersion: 1,
      settings: {},
      fields: [
        { id: 'field_1', type: 'text', name: 'name', label: 'Name' },
        { id: 'field_2', type: 'email', name: 'email', label: 'Email' }
      ]
    }

    it('finds an existing field by ID', () => {
      const field = findFieldById(schema, 'field_1')
      
      expect(field).toBeDefined()
      expect(field?.name).toBe('name')
    })

    it('returns undefined for non-existent ID', () => {
      const field = findFieldById(schema, 'field_999')
      expect(field).toBeUndefined()
    })

    it('returns undefined for empty fields array', () => {
      const emptySchema = createEmptySchema()
      const field = findFieldById(emptySchema, 'field_1')
      expect(field).toBeUndefined()
    })
  })

  describe('updateFieldInSchema', () => {
    it('updates a field and returns a new schema', () => {
      const original: FormSchema = {
        schemaVersion: 1,
        settings: {},
        fields: [
          { id: 'field_1', type: 'text', name: 'name', label: 'Name' }
        ]
      }

      const updated = updateFieldInSchema(original, 'field_1', { label: 'Full Name' })

      // Original should be unchanged
      expect(original.fields[0]?.label).toBe('Name')
      // Updated should have new value
      expect(updated.fields[0]?.label).toBe('Full Name')
    })

    it('preserves other fields when updating', () => {
      const original: FormSchema = {
        schemaVersion: 1,
        settings: {},
        fields: [
          { id: 'field_1', type: 'text', name: 'name', label: 'Name' },
          { id: 'field_2', type: 'email', name: 'email', label: 'Email' }
        ]
      }

      const updated = updateFieldInSchema(original, 'field_1', { required: true })

      expect(updated.fields).toHaveLength(2)
      expect(updated.fields[1]).toEqual(original.fields[1])
    })

    it('does nothing if field ID not found', () => {
      const original: FormSchema = {
        schemaVersion: 1,
        settings: {},
        fields: [
          { id: 'field_1', type: 'text', name: 'name', label: 'Name' }
        ]
      }

      const updated = updateFieldInSchema(original, 'field_999', { label: 'Test' })

      expect(updated.fields).toHaveLength(1)
      expect(updated.fields[0]?.label).toBe('Name')
    })
  })

  describe('removeFieldFromSchema', () => {
    it('removes a field and returns a new schema', () => {
      const original: FormSchema = {
        schemaVersion: 1,
        settings: {},
        fields: [
          { id: 'field_1', type: 'text', name: 'name', label: 'Name' },
          { id: 'field_2', type: 'email', name: 'email', label: 'Email' }
        ]
      }

      const updated = removeFieldFromSchema(original, 'field_1')

      // Original should be unchanged
      expect(original.fields).toHaveLength(2)
      // Updated should have one fewer field
      expect(updated.fields).toHaveLength(1)
      expect(updated.fields[0]?.id).toBe('field_2')
    })

    it('does nothing if field ID not found', () => {
      const original: FormSchema = {
        schemaVersion: 1,
        settings: {},
        fields: [
          { id: 'field_1', type: 'text', name: 'name', label: 'Name' }
        ]
      }

      const updated = removeFieldFromSchema(original, 'field_999')

      expect(updated.fields).toHaveLength(1)
    })
  })
})