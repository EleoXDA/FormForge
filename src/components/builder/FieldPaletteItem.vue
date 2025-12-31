<script setup lang="ts">
import type { FieldType } from '@/types'

interface Props {
  type: FieldType
  label: string
  icon: string
}

defineProps<Props>()
</script>

<template>
  <div class="field-palette-item">
    <q-icon :name="icon" size="20px" class="q-mr-sm text-grey-7" />
    <span class="text-body2">{{ label }}</span>
    <q-icon name="drag_indicator" size="16px" class="drag-handle text-grey-5" />
  </div>
</template>

<style scoped>
.field-palette-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.15s ease;
  user-select: none;
}

.field-palette-item:hover {
  border-color: #1976d2;
  background: #f8faff;
}

.field-palette-item:active {
  cursor: grabbing;
}

.drag-handle {
  margin-left: auto;
}

/* Style when being dragged */
.field-palette-item.sortable-ghost {
  opacity: 0.4;
}

.field-palette-item.sortable-chosen {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>