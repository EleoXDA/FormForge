<script setup lang="ts">
import type { TextareaField } from '@/types'

interface Props {
  field: TextareaField
  modelValue: string
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onUpdate(value: string | number | null) {
  emit('update:modelValue', String(value ?? ''))
}
</script>

<template>
  <q-input
    type="textarea"
    :model-value="props.modelValue"
    :label="props.field.label"
    :placeholder="props.field.placeholder"
    :hint="props.field.helpText"
    :error="!!props.error"
    :error-message="props.error"
    :disable="props.field.disabled"
    :rows="props.field.rows ?? 4"
    outlined
    @update:model-value="onUpdate"
  />
</template>