<script setup lang="ts">
import type { DateField } from '@/types'

interface Props {
  field: DateField
  modelValue: string
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onUpdate(value: string | number | null) {
  emit('update:modelValue', value == null ? '' : String(value))
}
</script>

<template>
  <q-input
    :model-value="props.modelValue"
    :label="props.field.label"
    :hint="props.field.helpText"
    :error="!!props.error"
    :error-message="props.error"
    :disable="props.field.disabled"
    outlined
    mask="####-##-##"
    @update:model-value="onUpdate"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            :model-value="props.modelValue"
            :options="(date: string) => {
              if (props.field.minDate && date < props.field.minDate) return false
              if (props.field.maxDate && date > props.field.maxDate) return false
              return true
            }"
            @update:model-value="onUpdate"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>