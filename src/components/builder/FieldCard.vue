<script setup lang="ts">
import { computed } from 'vue'
import type { FormField } from '@/types'

interface Props {
  field: FormField
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})

const emit = defineEmits<{
  select: []
  delete: []
  duplicate: []
}>()

/**
 * Get an icon representing the field type.
 */
const fieldIcon = computed(() => {
  const iconMap: Record<string, string> = {
    text: 'short_text',
    email: 'email',
    number: 'pin',
    phone: 'phone',
    textarea: 'notes',
    select: 'arrow_drop_down_circle',
    multiselect: 'checklist',
    radio: 'radio_button_checked',
    checkbox: 'check_box',
    date: 'event'
  }
  return iconMap[props.field.type] || 'input'
})

/**
 * Display label - show placeholder if empty.
 */
const displayLabel = computed(() => {
  return props.field.label || 'Untitled Field'
})

/**
 * Stop click propagation when clicking action buttons.
 */
function handleDelete(event: Event) {
  event.stopPropagation()
  emit('delete')
}

function handleDuplicate(event: Event) {
  event.stopPropagation()
  emit('duplicate')
}
</script>

<template>
  <div
    class="field-card"
    :class="{ 'field-card--selected': props.selected }"
    @click="emit('select')"
  >
    <!-- Drag Handle -->
    <div class="field-card__handle">
      <q-icon name="drag_indicator" size="18px" color="grey-5" />
    </div>

    <!-- Field Info -->
    <div class="field-card__content">
      <div class="field-card__header">
        <q-icon :name="fieldIcon" size="18px" color="grey-7" class="q-mr-sm" />
        <span class="field-card__label">{{ displayLabel }}</span>
        <q-badge
          v-if="props.field.required"
          color="orange"
          text-color="white"
          label="Required"
          class="q-ml-sm"
        />
      </div>
      <div class="field-card__meta">
        <span class="text-caption text-grey-6">{{ props.field.type }}</span>
        <span v-if="props.field.name" class="text-caption text-grey-5 q-ml-sm">
          · {{ props.field.name }}
        </span>
      </div>
    </div>

    <!-- Action Buttons (visible on hover/selection) -->
    <div class="field-card__actions">
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="content_copy"
        color="grey-7"
        @click="handleDuplicate"
      >
        <q-tooltip>Duplicate</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="delete_outline"
        color="negative"
        @click="handleDelete"
      >
        <q-tooltip>Delete</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.field-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.field-card:hover {
  border-color: #90caf9;
  background: #fafafa;
}

.field-card--selected {
  border-color: #1976d2;
  background: #e3f2fd;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.field-card__handle {
  cursor: grab;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;
}

.field-card__handle:hover {
  background: #f0f0f0;
}

.field-card__handle:active {
  cursor: grabbing;
}

.field-card__content {
  flex: 1;
  min-width: 0;
}

.field-card__header {
  display: flex;
  align-items: center;
}

.field-card__label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-card__meta {
  margin-top: 2px;
}

.field-card__actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.field-card:hover .field-card__actions,
.field-card--selected .field-card__actions {
  opacity: 1;
}

/* Drag and drop styling */
.field-card.sortable-ghost {
  opacity: 0.4;
}

.field-card.sortable-chosen {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
</style>