<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import type { FieldOption } from '@/types'
import PropertySection from './PropertySection.vue'

interface Props {
  options: FieldOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:options': [options: FieldOption[]]
}>()

// Local copy for draggable binding
const localOptions = ref<FieldOption[]>([...props.options])

// Sync from props when they change externally
watch(
  () => props.options,
  (newOptions) => {
    localOptions.value = [...newOptions]
  },
  { deep: true }
)

// Emit changes when local options change
watch(
  localOptions,
  (newOptions) => {
    emit('update:options', [...newOptions])
  },
  { deep: true }
)

function addOption() {
  const index = localOptions.value.length + 1
  localOptions.value.push({
    value: `option${index}`,
    label: `Option ${index}`
  })
}

function removeOption(index: number) {
  localOptions.value.splice(index, 1)
}

function updateOptionValue(index: number, value: string) {
  const option = localOptions.value[index]
  if (option) {
    option.value = value
  }
}

function updateOptionLabel(index: number, label: string) {
  const option = localOptions.value[index]
  if (option) {
    option.label = label
    // Auto-generate value from label if empty
    if (!option.value) {
      option.value = label.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    }
  }
}
</script>

<template>
  <PropertySection title="Options">
    <draggable
      v-model="localOptions"
      item-key="value"
      handle=".option-handle"
      animation="150"
      class="options-list"
    >
      <template #item="{ element, index }">
        <div class="option-row">
          <q-icon name="drag_indicator" size="18px" class="option-handle text-grey-5" />
          
          <q-input
            :model-value="element.label"
            dense
            outlined
            placeholder="Label"
            class="option-input"
            @update:model-value="(v) => updateOptionLabel(index, String(v))"
          />
          
          <q-input
            :model-value="element.value"
            dense
            outlined
            placeholder="Value"
            class="option-input option-input--value"
            @update:model-value="(v) => updateOptionValue(index, String(v))"
          />
          
          <q-btn
            flat
            round
            dense
            size="sm"
            icon="close"
            color="grey-6"
            :disable="localOptions.length <= 1"
            @click="removeOption(index)"
          />
        </div>
      </template>
    </draggable>

    <q-btn
      flat
      dense
      color="primary"
      icon="add"
      label="Add Option"
      class="q-mt-sm full-width"
      @click="addOption"
    />
  </PropertySection>
</template>

<style scoped>
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.option-handle {
  cursor: grab;
  flex-shrink: 0;
}

.option-handle:active {
  cursor: grabbing;
}

.option-input {
  flex: 1;
  min-width: 0;
}

.option-input--value {
  flex: 0.7;
}

/* Compact input styling */
.option-input :deep(.q-field__control) {
  height: 32px;
}

.option-input :deep(.q-field__native) {
  padding: 4px 8px;
  font-size: 13px;
}
</style>