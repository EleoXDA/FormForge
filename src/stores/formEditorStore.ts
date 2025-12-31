import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FormSchema, FormField, FormMeta } from '@/types'
import { createEmptySchema, generateFormId } from '@/utils'

/**
 * Store for managing the form currently being edited in the builder.
 * Handles schema modifications, field selection, and tracks unsaved changes.
 */
export const useFormEditorStore = defineStore(
  'formEditor',
  () => {
    // ============================================
    // State
    // ============================================

    /** Metadata about the form (id, title, status, etc.) */
    const meta = ref<FormMeta | null>(null)

    /** The form schema being edited */
    const schema = ref<FormSchema>(createEmptySchema())

    /** ID of the currently selected field (null if none selected) */
    const selectedFieldId = ref<string | null>(null)

    /** Whether the schema has unsaved changes */
    const isDirty = ref(false)

    /** Loading state for async operations */
    const isLoading = ref(false)

    // ============================================
    // History (Undo/Redo)
    // ============================================

    /** Maximum number of history states to keep */
    const MAX_HISTORY = 50

    /** Stack of previous schema states for undo */
    const historyStack = ref<FormSchema[]>([])

    /** Stack of undone states for redo */
    const redoStack = ref<FormSchema[]>([])

    /** Error message from last failed operation */
    const error = ref<string | null>(null)

    // ============================================
    // Getters (computed)
    // ============================================

    /** The currently selected field object, or null */
    const selectedField = computed((): FormField | null => {
      if (!selectedFieldId.value) return null
      return schema.value.fields.find((f) => f.id === selectedFieldId.value) ?? null
    })

    /** Whether undo is available */
    const canUndo = computed(() => historyStack.value.length > 0)

    /** Whether redo is available */
    const canRedo = computed(() => redoStack.value.length > 0)

    /** Total number of fields in the form */
    const fieldCount = computed(() => schema.value.fields.length)

    /** Whether the form is empty (no fields) */
    const isEmpty = computed(() => schema.value.fields.length === 0)

    // ============================================
    // Actions
    // ============================================

    /**
     * Initialize a new empty form for editing.
     */
    function createNewForm(title: string = 'Untitled Form') {
      const id = generateFormId()
      meta.value = {
        id,
        slug: id,
        title,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      schema.value = createEmptySchema()
      selectedFieldId.value = null
      isDirty.value = false
      error.value = null
    }

    /**
     * Load an existing form for editing.
     */
    function loadForm(formMeta: FormMeta, formSchema: FormSchema) {
      meta.value = formMeta
      schema.value = formSchema
      selectedFieldId.value = null
      isDirty.value = false
      error.value = null
    }

    /**
     * Select a field by ID for editing in the inspector.
     */
    function selectField(fieldId: string | null) {
      selectedFieldId.value = fieldId
    }

    /**
     * Clear the current selection.
     */
    function clearSelection() {
      selectedFieldId.value = null
    }

    /**
     * Push current state to history before making changes.
     * Call this before any schema modification.
     */
    function pushToHistory() {
      // Deep clone the current schema
      const snapshot = JSON.parse(JSON.stringify(schema.value)) as FormSchema
      historyStack.value.push(snapshot)

      // Limit history size
      if (historyStack.value.length > MAX_HISTORY) {
        historyStack.value.shift()
      }

      // Clear redo stack when new changes are made
      redoStack.value = []
    }

    /**
     * Undo the last change.
     */
    function undo() {
      if (!canUndo.value) return

      // Save current state to redo stack
      const currentSnapshot = JSON.parse(JSON.stringify(schema.value)) as FormSchema
      redoStack.value.push(currentSnapshot)

      // Restore previous state
      const previousState = historyStack.value.pop()
      if (previousState) {
        schema.value = previousState
        isDirty.value = true

        // Clear selection if the selected field no longer exists
        if (selectedFieldId.value) {
          const stillExists = schema.value.fields.some((f) => f.id === selectedFieldId.value)
          if (!stillExists) {
            selectedFieldId.value = null
          }
        }
      }
    }

    /**
     * Redo a previously undone change.
     */
    function redo() {
      if (!canRedo.value) return

      // Save current state to history
      const currentSnapshot = JSON.parse(JSON.stringify(schema.value)) as FormSchema
      historyStack.value.push(currentSnapshot)

      // Restore the undone state
      const redoState = redoStack.value.pop()
      if (redoState) {
        schema.value = redoState
        isDirty.value = true
      }
    }

    /**
     * Add a new field to the schema at a specific index.
     * If no index provided, appends to the end.
     */
    function addField(field: FormField, index?: number) {
      pushToHistory()
      const insertIndex = index ?? schema.value.fields.length
      schema.value.fields.splice(insertIndex, 0, field)
      isDirty.value = true
      // Auto-select the newly added field
      selectedFieldId.value = field.id
    }

    /**
     * Remove a field from the schema by ID.
     */
    function removeField(fieldId: string) {
      const index = schema.value.fields.findIndex((f) => f.id === fieldId)
      if (index === -1) return

      pushToHistory()
      schema.value.fields.splice(index, 1)
      isDirty.value = true

      // Clear selection if the removed field was selected
      if (selectedFieldId.value === fieldId) {
        selectedFieldId.value = null
      }
    }

    /**
     * Update a field's properties by ID.
     */
    function updateField(fieldId: string, updates: Partial<FormField>) {
      const field = schema.value.fields.find((f) => f.id === fieldId)
      if (!field) return

      pushToHistory()
      Object.assign(field, updates)
      isDirty.value = true
    }

    /**
     * Move a field from one index to another (for drag-drop reordering).
     */
    function moveField(fromIndex: number, toIndex: number) {
      if (fromIndex === toIndex) return
      if (fromIndex < 0 || fromIndex >= schema.value.fields.length) return
      if (toIndex < 0 || toIndex >= schema.value.fields.length) return

      pushToHistory()
      const [movedField] = schema.value.fields.splice(fromIndex, 1)
      if (movedField) {
        schema.value.fields.splice(toIndex, 0, movedField)
        isDirty.value = true
      }
    }

    /**
     * Update the fields array directly (used by drag-drop library).
     */
    function setFields(fields: FormField[]) {
      pushToHistory()
      schema.value.fields = fields
      isDirty.value = true
    }

    /**
     * Update form settings.
     */
    function updateSettings(updates: Partial<FormSchema['settings']>) {
      schema.value.settings = { ...schema.value.settings, ...updates }
      isDirty.value = true
    }

    /**
     * Mark the form as saved (clear dirty flag).
     */
    function markAsSaved() {
      isDirty.value = false
      if (meta.value) {
        meta.value.updatedAt = new Date().toISOString()
      }
    }

    /**
     * Reset the store to initial state.
     */
    function reset() {
      meta.value = null
      schema.value = createEmptySchema()
      selectedFieldId.value = null
      isDirty.value = false
      isLoading.value = false
      error.value = null
    }

    return {
      // State
      meta,
      schema,
      selectedFieldId,
      isDirty,
      isLoading,
      error,
      // Getters
      canUndo,
      canRedo,
      selectedField,
      fieldCount,
      isEmpty,
      // Actions
      createNewForm,
      loadForm,
      selectField,
      clearSelection,
      pushToHistory,
      undo,
      redo,
      addField,
      removeField,
      updateField,
      moveField,
      setFields,
      updateSettings,
      markAsSaved,
      reset
    }
  },
  {
    // Enable persistence to localStorage for auto-save
    persist: {
      key: 'formforge-editor',
      pick: ['meta', 'schema', 'isDirty']
    }
  }
)
