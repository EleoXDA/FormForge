<script setup lang="ts">
import type { MultiselectField } from '@/types'

interface Props {
  field: MultiselectField
  modelValue: string[]
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function onUpdate(value: string[] | null) {
  emit('update:modelValue', value ?? [])
}
</script>

<template>
  <q-select
    multiple
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
    use-chips
    outlined
    @update:model-value="onUpdate"
  />
</template>