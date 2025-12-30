<script setup lang="ts">
import type { TextField } from '@/types'

interface Props {
  field: TextField
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
    :model-value="props.modelValue"
    :label="props.field.label"
    :placeholder="props.field.placeholder"
    :hint="props.field.helpText"
    :error="!!props.error"
    :error-message="props.error"
    :disable="props.field.disabled"
    :rules="props.field.required ? [(v: string) => !!v || 'This field is required'] : []"
    outlined
    @update:model-value="onUpdate"
  />
</template>