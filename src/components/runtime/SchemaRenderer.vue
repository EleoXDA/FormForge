<script setup lang="ts">
import { computed } from 'vue'
import type { FormSchema, FormField } from '@/types'
import { fieldComponentMap } from './fields'
import {
  getVisibleFields,
  isFieldRequired,
  isFieldDisabled,
  filterVisibleAnswers
} from '@/utils'

interface Props {
  schema: FormSchema
  modelValue: Record<string, unknown>
  errors?: Record<string, string>
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: [values: Record<string, unknown>]
}>()

/**
 * Visible fields with `required`/`disabled` resolved from conditional logic,
 * so the existing field renderers honour requiredIf / disableIf rules.
 */
const renderFields = computed<FormField[]>(() =>
  getVisibleFields(props.schema, props.modelValue).map(
    (field) =>
      ({
        ...field,
        required: isFieldRequired(field, props.schema, props.modelValue),
        disabled: props.disabled || isFieldDisabled(field, props.schema, props.modelValue)
      }) as FormField
  )
)

function getFieldComponent(field: FormField) {
  return fieldComponentMap[field.type]
}

function getFieldValue(field: FormField): unknown {
  const value = props.modelValue[field.name]
  if (value !== undefined) return value
  
  // Return appropriate default based on type
  if (field.type === 'checkbox' && field.options) return []
  if (field.type === 'multiselect') return []
  if (field.type === 'number') return null
  if (field.type === 'checkbox') return false
  return ''
}

function updateFieldValue(field: FormField, value: unknown) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field.name]: value
  })
}

function handleSubmit() {
  // Only submit answers for currently-visible fields.
  emit('submit', filterVisibleAnswers(props.schema, props.modelValue))
}

const submitButtonText = computed(() => props.schema.settings.submitButtonText || 'Submit')
</script>

<template>
  <q-form class="schema-renderer" @submit.prevent="handleSubmit">
    <div
      v-for="field in renderFields"
      :key="field.id"
      class="q-mb-md"
    >
      <component
        :is="getFieldComponent(field)"
        :field="field"
        :model-value="getFieldValue(field)"
        :error="props.errors[field.name]"
        :disabled="field.disabled"
        @update:model-value="(v: unknown) => updateFieldValue(field, v)"
      />
    </div>
    
    <div class="q-mt-lg">
      <q-btn
        type="submit"
        color="primary"
        :label="submitButtonText"
        :disable="props.disabled"
      />
    </div>
  </q-form>
</template>

<style scoped>
.schema-renderer {
  max-width: 600px;
}
</style>