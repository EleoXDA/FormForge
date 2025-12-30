<script setup lang="ts">
import type { NumberField } from '@/types'

interface Props {
  field: NumberField
  modelValue: number | null
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

function onUpdate(value: string | number | null) {
  const num = value === '' || value === null ? null : Number(value)
  emit('update:modelValue', num)
}
</script>

<template>
  <q-input
    type="number"
    :model-value="props.modelValue"
    :label="props.field.label"
    :placeholder="props.field.placeholder"
    :hint="props.field.helpText"
    :error="!!props.error"
    :error-message="props.error"
    :disable="props.field.disabled"
    :min="props.field.validation?.min"
    :max="props.field.validation?.max"
    :step="props.field.step"
    outlined
    @update:model-value="onUpdate"
  />
</template>