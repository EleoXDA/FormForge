<script setup lang="ts">
import type { RadioField } from '@/types'

interface Props {
  field: RadioField
  modelValue: string
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <div v-if="props.field.label" class="text-subtitle2 q-mb-xs">{{ props.field.label }}</div>
    
    <q-option-group
      type="radio"
      :model-value="props.modelValue"
      :options="props.field.options"
      :disable="props.field.disabled"
      @update:model-value="onUpdate"
    />
    
    <div v-if="props.field.helpText" class="text-caption text-grey q-mt-xs">
      {{ props.field.helpText }}
    </div>
    <div v-if="props.error" class="text-negative text-caption q-mt-xs">{{ props.error }}</div>
  </div>
</template>