<script setup lang="ts">
import type { CheckboxField } from '@/types'

interface Props {
  field: CheckboxField
  modelValue: boolean | string[]
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean | string[]]
}>()

const hasOptions = computed(() => props.field.options && props.field.options.length > 0)

function onSingleUpdate(value: boolean) {
  emit('update:modelValue', value)
}

function onGroupUpdate(value: string[]) {
  emit('update:modelValue', value)
}
</script>

<script lang="ts">
import { computed } from 'vue'
</script>

<template>
  <div>
    <div v-if="props.field.label" class="text-subtitle2 q-mb-xs">{{ props.field.label }}</div>
    
    <q-checkbox
      v-if="!hasOptions"
      :model-value="props.modelValue as boolean"
      :label="props.field.helpText || 'Yes'"
      :disable="props.field.disabled"
      @update:model-value="onSingleUpdate"
    />
    
    <q-option-group
      v-else
      type="checkbox"
      :model-value="(props.modelValue as string[])"
      :options="props.field.options"
      :disable="props.field.disabled"
      @update:model-value="onGroupUpdate"
    />
    
    <div v-if="props.error" class="text-negative text-caption q-mt-xs">{{ props.error }}</div>
  </div>
</template>