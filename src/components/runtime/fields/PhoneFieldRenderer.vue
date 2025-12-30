<script setup lang="ts">
import type { PhoneField } from '@/types'

interface Props {
  field: PhoneField
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
    type="tel"
    :model-value="props.modelValue"
    :label="props.field.label"
    :placeholder="props.field.placeholder || '+1 (555) 123-4567'"
    :hint="props.field.helpText"
    :error="!!props.error"
    :error-message="props.error"
    :disable="props.field.disabled"
    outlined
    @update:model-value="onUpdate"
  />
</template>