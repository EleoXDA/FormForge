<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import type { FieldType, FormField } from '@/types'
import { createDefaultField } from '@/utils'
import FieldPaletteItem from './FieldPaletteItem.vue'

/**
 * Configuration for each field type in the palette.
 * Maps field types to their display properties.
 */
interface FieldTypeConfig {
  type: FieldType
  label: string
  icon: string
  category: 'text' | 'choice' | 'special'
}

const fieldTypes: FieldTypeConfig[] = [
  // Text inputs
  { type: 'text', label: 'Text Input', icon: 'short_text', category: 'text' },
  { type: 'email', label: 'Email', icon: 'email', category: 'text' },
  { type: 'number', label: 'Number', icon: 'pin', category: 'text' },
  { type: 'phone', label: 'Phone', icon: 'phone', category: 'text' },
  { type: 'textarea', label: 'Long Text', icon: 'notes', category: 'text' },
  // Choice inputs
  { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle', category: 'choice' },
  { type: 'multiselect', label: 'Multi-Select', icon: 'checklist', category: 'choice' },
  { type: 'radio', label: 'Radio Buttons', icon: 'radio_button_checked', category: 'choice' },
  { type: 'checkbox', label: 'Checkbox', icon: 'check_box', category: 'choice' },
  // Special inputs
  { type: 'date', label: 'Date Picker', icon: 'event', category: 'special' }
]

// Group fields by category for display
const textFields = computed(() => fieldTypes.filter((f) => f.category === 'text'))
const choiceFields = computed(() => fieldTypes.filter((f) => f.category === 'choice'))
const specialFields = computed(() => fieldTypes.filter((f) => f.category === 'special'))

/**
 * Clone function for draggable - creates a new field definition
 * when a palette item is dragged.
 */
function cloneField(item: FieldTypeConfig): FormField {
  const field = createDefaultField(item.type)
  // Set a default label based on the type
  field.label = item.label
  // Generate a unique name from the type and a random suffix
  field.name = `${item.type}_${field.id.slice(-4)}`
  return field
}
</script>

<template>
  <div class="field-palette">
    <!-- Text Inputs Category -->
    <div class="category-section">
      <div class="category-label">Text Inputs</div>
      <draggable
        :list="textFields"
        :group="{ name: 'fields', pull: 'clone', put: false }"
        :clone="cloneField"
        :sort="false"
        item-key="type"
        class="palette-list"
      >
        <template #item="{ element }">
          <FieldPaletteItem
            :type="element.type"
            :label="element.label"
            :icon="element.icon"
          />
        </template>
      </draggable>
    </div>

    <!-- Choice Inputs Category -->
    <div class="category-section">
      <div class="category-label">Choice Inputs</div>
      <draggable
        :list="choiceFields"
        :group="{ name: 'fields', pull: 'clone', put: false }"
        :clone="cloneField"
        :sort="false"
        item-key="type"
        class="palette-list"
      >
        <template #item="{ element }">
          <FieldPaletteItem
            :type="element.type"
            :label="element.label"
            :icon="element.icon"
          />
        </template>
      </draggable>
    </div>

    <!-- Special Inputs Category -->
    <div class="category-section">
      <div class="category-label">Special</div>
      <draggable
        :list="specialFields"
        :group="{ name: 'fields', pull: 'clone', put: false }"
        :clone="cloneField"
        :sort="false"
        item-key="type"
        class="palette-list"
      >
        <template #item="{ element }">
          <FieldPaletteItem
            :type="element.type"
            :label="element.label"
            :icon="element.icon"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
.field-palette {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  padding: 0 4px;
}

.palette-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>