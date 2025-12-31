<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import type { FormField } from '@/types'
import { useFormEditorStore } from '@/stores'
import FieldCard from './FieldCard.vue'
import { createDefaultField } from '@/utils'

const store = useFormEditorStore()

/**
 * Local copy of fields for vuedraggable binding.
 * We sync changes back to the store.
 */
const localFields = computed({
  get: () => store.schema.fields,
  set: (newFields: FormField[]) => {
    store.setFields(newFields)
  }
})

const isEmpty = computed(() => store.isEmpty)
const selectedFieldId = computed(() => store.selectedFieldId)

function handleFieldSelect(fieldId: string) {
  store.selectField(fieldId)
}

function handleFieldDelete(fieldId: string) {
  store.removeField(fieldId)
}

function handleFieldDuplicate(fieldId: string) {
  const field = store.schema.fields.find((f) => f.id === fieldId)
  if (!field) return
  
  // Create a new field with the same type and copy properties
  const duplicated = createDefaultField(field.type)
  Object.assign(duplicated, {
    ...field,
    id: duplicated.id, // Keep the new unique ID
    name: `${field.name}_copy`,
    label: `${field.label} (Copy)`
  })
  
  // Find the original index and insert after it
  const originalIndex = store.schema.fields.findIndex((f) => f.id === fieldId)
  store.addField(duplicated, originalIndex + 1)
}

/**
 * Handle click on the canvas background to clear selection.
 */
function handleCanvasClick(event: MouseEvent) {
  // Only clear if clicking directly on the canvas, not on a child
  if (event.target === event.currentTarget) {
    store.clearSelection()
  }
}
</script>

<template>
  <div class="builder-canvas" @click="handleCanvasClick">
    <!-- Empty State -->
    <div v-if="isEmpty" class="canvas-empty-state">
      <q-icon name="add_circle_outline" size="64px" color="grey-4" />
      <h3 class="text-h6 text-grey-6 q-mt-md q-mb-sm">Start Building Your Form</h3>
      <p class="text-body2 text-grey-5">
        Drag fields from the left panel and drop them here
      </p>
    </div>

    <!-- Fields List (Draggable) -->
    <draggable
      v-model="localFields"
      :group="{ name: 'fields', pull: true, put: true }"
      item-key="id"
      handle=".field-card__handle"
      ghost-class="sortable-ghost"
      chosen-class="sortable-chosen"
      animation="150"
      class="canvas-fields"
      :class="{ 'canvas-fields--empty': isEmpty }"
    >
      <template #item="{ element }">
        <FieldCard
          :field="element"
          :selected="selectedFieldId === element.id"
          @select="handleFieldSelect(element.id)"
          @delete="handleFieldDelete(element.id)"
          @duplicate="handleFieldDuplicate(element.id)"
        />
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.builder-canvas {
  min-height: 100%;
  padding: 24px;
}

.canvas-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 48px;
}

.canvas-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
  padding: 16px;
  border: 2px dashed transparent;
  border-radius: 12px;
  transition: border-color 0.2s, background 0.2s;
}

/* Show drop zone indicator when dragging */
.canvas-fields--empty {
  min-height: 400px;
}

/* Highlight when items can be dropped */
.canvas-fields.sortable-drag {
  border-color: #90caf9;
  background: rgba(25, 118, 210, 0.05);
}
</style>