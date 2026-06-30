<script setup lang="ts">
import { computed } from 'vue'
import type { FormField, FieldOption, ValidationRules, FieldLogic } from '@/types'
import CommonPropertiesEditor from './CommonPropertiesEditor.vue'
import OptionsEditor from './OptionsEditor.vue'
import ValidationEditor from './ValidationEditor.vue'
import FilePropertiesEditor from './FilePropertiesEditor.vue'
import LogicEditor from './LogicEditor.vue'

interface Props {
  field: FormField
  availableFields?: FormField[]
}

const props = withDefaults(defineProps<Props>(), {
  availableFields: () => []
})

const emit = defineEmits<{
  'update:field': [updates: Partial<FormField>]
}>()

/**
 * Get icon for the field type.
 */
const fieldIcon = computed(() => {
  const iconMap: Record<string, string> = {
    text: 'short_text',
    email: 'email',
    number: 'pin',
    phone: 'phone',
    textarea: 'notes',
    select: 'arrow_drop_down_circle',
    multiselect: 'checklist',
    radio: 'radio_button_checked',
    checkbox: 'check_box',
    date: 'event',
    file: 'attach_file'
  }
  return iconMap[props.field.type] || 'input'
})

/**
 * Determine if this field type has options.
 */
const hasOptions = computed(() => 
  ['select', 'multiselect', 'radio'].includes(props.field.type) ||
  (props.field.type === 'checkbox' && 'options' in props.field)
)

/**
 * Determine if this field type has validation rules.
 */
const hasValidation = computed(() => 
  ['text', 'email', 'number', 'textarea', 'phone'].includes(props.field.type)
)

/**
 * Determine if this field type has file-upload options.
 */
const hasFileProps = computed(() => props.field.type === 'file')

/**
 * Current file-upload options (if applicable).
 */
const fileAccept = computed(() =>
  props.field.type === 'file' ? props.field.accept : undefined
)
const fileMaxSizeMb = computed(() =>
  props.field.type === 'file' ? props.field.maxSizeMb : undefined
)

/**
 * Get the current options array (if applicable).
 */
const fieldOptions = computed(() => {
  if ('options' in props.field && props.field.options) {
    return props.field.options
  }
  return []
})

/**
 * Get current validation rules (if applicable).
 */
const fieldValidation = computed(() => {
  if ('validation' in props.field) {
    return props.field.validation
  }
  return undefined
})

function handleFieldUpdate(updates: Partial<FormField>) {
  emit('update:field', updates)
}

function handleOptionsUpdate(options: FieldOption[]) {
  emit('update:field', { options } as Partial<FormField>)
}

function handleValidationUpdate(validation: ValidationRules | undefined) {
  emit('update:field', { validation } as Partial<FormField>)
}

function handleFileUpdate(updates: { accept?: string; maxSizeMb?: number }) {
  emit('update:field', updates as Partial<FormField>)
}

/**
 * Fields that this field's conditions may depend on (everything but itself).
 */
const logicFields = computed(() =>
  props.availableFields.filter((f) => f.id !== props.field.id)
)

function handleLogicUpdate(logic: FieldLogic | undefined) {
  emit('update:field', { logic } as Partial<FormField>)
}
</script>

<template>
  <div class="property-inspector">
    <!-- Header showing field type -->
    <div class="inspector-header">
      <q-icon :name="fieldIcon" size="24px" color="primary" />
      <div class="inspector-header__info">
        <div class="text-subtitle2">{{ props.field.label || 'Untitled Field' }}</div>
        <div class="text-caption text-grey-6">{{ props.field.type }} field</div>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Common Properties (all field types) -->
    <CommonPropertiesEditor
      :field="props.field"
      @update:field="handleFieldUpdate"
    />

    <!-- Options Editor (select, radio, checkbox) -->
    <OptionsEditor
      v-if="hasOptions"
      :options="fieldOptions"
      @update:options="handleOptionsUpdate"
    />

    <!-- Validation Editor (text, email, number, etc.) -->
    <ValidationEditor
      v-if="hasValidation"
      :validation="fieldValidation"
      :field-type="props.field.type"
      @update:validation="handleValidationUpdate"
    />

    <!-- File Options (file uploads) -->
    <FilePropertiesEditor
      v-if="hasFileProps"
      :accept="fileAccept"
      :max-size-mb="fileMaxSizeMb"
      @update:file="handleFileUpdate"
    />

    <!-- Conditional Logic (all field types) -->
    <LogicEditor
      :field="props.field"
      :available-fields="logicFields"
      @update:logic="handleLogicUpdate"
    />

    <!-- Field ID (read-only, for debugging) -->
    <div class="q-mt-lg q-pt-md" style="border-top: 1px solid #eee">
      <div class="text-caption text-grey-5">
        Field ID: <code>{{ props.field.id }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.property-inspector {
  padding: 4px 0;
}

.inspector-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inspector-header__info {
  flex: 1;
  min-width: 0;
}

.inspector-header__info .text-subtitle2 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>