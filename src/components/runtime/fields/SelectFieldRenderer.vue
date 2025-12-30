<script setup lang="ts">
import type { SelectField } from '@/types'

interface Props {
  field: SelectField
  modelValue: string
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onUpdate(value: string | null) {
  emit('update:modelValue', value ?? '')
}
</script>

<template>
  <q-select
    :model-value="props.modelValue"
    :label="props.field.label"
    :hint="props.field.helpText"
    :error="!!props.error"
    :error-message="props.error"
    :disable="props.field.disabled"
    :options="props.field.options"
    option-value="value"
    option-label="label"
    emit-value
    map-options
    outlined
    @update:model-value="onUpdate"
  />
</template>