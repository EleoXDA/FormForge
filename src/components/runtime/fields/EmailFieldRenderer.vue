<script setup lang="ts">
import type { EmailField } from '@/types'

interface Props {
  field: EmailField
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

const emailRule = (v: string) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !v || pattern.test(v) || 'Please enter a valid email'
}
</script>

<template>
  <q-input
    type="email"
    :model-value="props.modelValue"
    :label="props.field.label"
    :placeholder="props.field.placeholder"
    :hint="props.field.helpText"
    :error="!!props.error"
    :error-message="props.error"
    :disable="props.field.disabled"
    :rules="[...(props.field.required ? [(v: string) => !!v || 'This field is required'] : []), emailRule]"
    outlined
    @update:model-value="onUpdate"
  />
</template>