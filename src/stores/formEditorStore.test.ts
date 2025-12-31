import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormEditorStore } from './formEditorStore'
import { createDefaultField } from '@/utils'

describe('formEditorStore', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts with null meta', () => {
      const store = useFormEditorStore()
      expect(store.meta).toBeNull()
    })

    it('starts with empty schema', () => {
      const store = useFormEditorStore()
      expect(store.schema.fields).toEqual([])
    })

    it('starts with no selected field', () => {
      const store = useFormEditorStore()
      expect(store.selectedFieldId).toBeNull()
      expect(store.selectedField).toBeNull()
    })

    it('starts with isDirty false', () => {
      const store = useFormEditorStore()
      expect(store.isDirty).toBe(false)
    })
  })

  describe('createNewForm', () => {
    it('creates meta with provided title', () => {
      const store = useFormEditorStore()
      store.createNewForm('Test Form')
      
      expect(store.meta).not.toBeNull()
      expect(store.meta?.title).toBe('Test Form')
    })

    it('creates meta with draft status', () => {
      const store = useFormEditorStore()
      store.createNewForm('Test Form')
      
      expect(store.meta?.status).toBe('draft')
    })

    it('resets schema to empty', () => {
      const store = useFormEditorStore()
      
      // Add a field first
      const field = createDefaultField('text')
      store.addField(field)
      
      // Create new form should reset
      store.createNewForm('New Form')
      
      expect(store.schema.fields).toEqual([])
    })

    it('clears selection', () => {
      const store = useFormEditorStore()
      
      // Add and select a field
      const field = createDefaultField('text')
      store.addField(field)
      store.selectField(field.id)
      
      // Create new form should clear selection
      store.createNewForm('New Form')
      
      expect(store.selectedFieldId).toBeNull()
    })
  })

  describe('addField', () => {
    it('adds a field to the schema', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      
      store.addField(field)
      
      expect(store.schema.fields).toHaveLength(1)
      expect(store.schema.fields[0]?.id).toBe(field.id)
    })

    it('adds field at specific index', () => {
      const store = useFormEditorStore()
      const field1 = createDefaultField('text')
      const field2 = createDefaultField('email')
      const field3 = createDefaultField('number')
      
      store.addField(field1)
      store.addField(field2)
      store.addField(field3, 1) // Insert at index 1
      
      expect(store.schema.fields[1]?.type).toBe('number')
    })

    it('auto-selects the newly added field', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      
      store.addField(field)
      
      expect(store.selectedFieldId).toBe(field.id)
    })

    it('sets isDirty to true', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      
      store.addField(field)
      
      expect(store.isDirty).toBe(true)
    })
  })

  describe('removeField', () => {
    it('removes a field by ID', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      store.addField(field)
      
      store.removeField(field.id)
      
      expect(store.schema.fields).toHaveLength(0)
    })

    it('clears selection if removed field was selected', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      store.addField(field)
      store.selectField(field.id)
      
      store.removeField(field.id)
      
      expect(store.selectedFieldId).toBeNull()
    })

    it('does nothing for non-existent ID', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      store.addField(field)
      
      store.removeField('non_existent_id')
      
      expect(store.schema.fields).toHaveLength(1)
    })
  })

  describe('updateField', () => {
    it('updates field properties', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      store.addField(field)
      
      store.updateField(field.id, { label: 'New Label' })
      
      expect(store.schema.fields[0]?.label).toBe('New Label')
    })

    it('preserves other properties when updating', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      field.label = 'Original'
      field.name = 'original_name'
      store.addField(field)
      
      store.updateField(field.id, { label: 'Updated' })
      
      expect(store.schema.fields[0]?.name).toBe('original_name')
    })
  })

  describe('selectField', () => {
    it('sets the selected field ID', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      store.addField(field)
      store.clearSelection()
      
      store.selectField(field.id)
      
      expect(store.selectedFieldId).toBe(field.id)
    })

    it('selectedField getter returns the field object', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      field.label = 'Test Field'
      store.addField(field)
      
      expect(store.selectedField?.label).toBe('Test Field')
    })
  })

  describe('moveField', () => {
    it('reorders fields correctly', () => {
      const store = useFormEditorStore()
      const field1 = createDefaultField('text')
      const field2 = createDefaultField('email')
      const field3 = createDefaultField('number')
      store.addField(field1)
      store.addField(field2)
      store.addField(field3)
      
      // Move field from index 0 to index 2
      store.moveField(0, 2)
      
      expect(store.schema.fields[0]?.type).toBe('email')
      expect(store.schema.fields[1]?.type).toBe('number')
      expect(store.schema.fields[2]?.type).toBe('text')
    })

    it('does nothing for invalid indices', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      store.addField(field)
      
      store.moveField(-1, 5)
      
      expect(store.schema.fields).toHaveLength(1)
    })
  })

  describe('undo/redo', () => {
    it('can undo an addField operation', () => {
      const store = useFormEditorStore()
      store.createNewForm('Test')
      
      const field = createDefaultField('text')
      store.addField(field)
      
      expect(store.schema.fields).toHaveLength(1)
      expect(store.canUndo).toBe(true)
      
      store.undo()
      
      expect(store.schema.fields).toHaveLength(0)
    })

    it('can redo after undo', () => {
      const store = useFormEditorStore()
      store.createNewForm('Test')
      
      const field = createDefaultField('text')
      store.addField(field)
      store.undo()
      
      expect(store.canRedo).toBe(true)
      
      store.redo()
      
      expect(store.schema.fields).toHaveLength(1)
    })

    it('clears redo stack when new changes are made', () => {
      const store = useFormEditorStore()
      store.createNewForm('Test')
      
      const field1 = createDefaultField('text')
      store.addField(field1)
      store.undo()
      
      expect(store.canRedo).toBe(true)
      
      // Make a new change
      const field2 = createDefaultField('email')
      store.addField(field2)
      
      expect(store.canRedo).toBe(false)
    })

    it('canUndo is false when history is empty', () => {
      const store = useFormEditorStore()
      store.createNewForm('Test')
      
      expect(store.canUndo).toBe(false)
    })
  })

  describe('markAsSaved', () => {
    it('sets isDirty to false', () => {
      const store = useFormEditorStore()
      const field = createDefaultField('text')
      store.addField(field)
      
      expect(store.isDirty).toBe(true)
      
      store.markAsSaved()
      
      expect(store.isDirty).toBe(false)
    })
  })

  describe('computed getters', () => {
    it('fieldCount returns correct count', () => {
      const store = useFormEditorStore()
      expect(store.fieldCount).toBe(0)
      
      store.addField(createDefaultField('text'))
      store.addField(createDefaultField('email'))
      
      expect(store.fieldCount).toBe(2)
    })

    it('isEmpty returns true when no fields', () => {
      const store = useFormEditorStore()
      expect(store.isEmpty).toBe(true)
      
      store.addField(createDefaultField('text'))
      
      expect(store.isEmpty).toBe(false)
    })
  })
})