<script setup lang="ts">
import { computed, watch } from 'vue'
import type { FormField } from '@/types'
import PropertySection from './PropertySection.vue'
import PropertyRow from './PropertyRow.vue'

interface Props {
  field: FormField
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:field': [updates: Partial<FormField>]
}>()

// Create local reactive copies of properties
const label = computed({
  get: () => props.field.label,
  set: (value: string) => emit('update:field', { label: value })
})

const name = computed({
  get: () => props.field.name,
  set: (value: string) => emit('update:field', { name: value })
})

const placeholder = computed({
  get: () => props.field.placeholder || '',
  set: (value: string) => emit('update:field', { placeholder: value || undefined })
})

const helpText = computed({
  get: () => props.field.helpText || '',
  set: (value: string) => emit('update:field', { helpText: value || undefined })
})

const required = computed({
  get: () => props.field.required || false,
  set: (value: boolean) => emit('update:field', { required: value })
})

const disabled = computed({
  get: () => props.field.disabled || false,
  set: (value: boolean) => emit('update:field', { disabled: value })
})

/**
 * Auto-generate name from label if name is empty.
 */
watch(label, (newLabel) => {
  if (!props.field.name && newLabel) {
    const generatedName = newLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
    emit('update:field', { name: generatedName })
  }
})
</script>

<template>
  <PropertySection title="Basic">
    <PropertyRow label="Label" hint="The text displayed above the input">
      <q-input
        v-model="label"
        dense
        outlined
        placeholder="Enter field label"
      />
    </PropertyRow>

    <PropertyRow label="Field Name" hint="Used as the key in form data (no spaces)">
      <q-input
        v-model="name"
        dense
        outlined
        placeholder="field_name"
        :rules="[(v: string) => /^[a-z][a-z0-9_]*$/i.test(v) || 'Use letters, numbers, underscores only']"
      />
    </PropertyRow>

    <PropertyRow label="Placeholder" hint="Hint text shown when the field is empty">
      <q-input
        v-model="placeholder"
        dense
        outlined
        placeholder="Enter placeholder text"
      />
    </PropertyRow>

    <PropertyRow label="Help Text" hint="Additional instructions shown below the field">
      <q-input
        v-model="helpText"
        dense
        outlined
        type="textarea"
        rows="2"
        placeholder="Optional help text"
      />
    </PropertyRow>
  </PropertySection>

  <PropertySection title="Behavior">
    <div class="q-gutter-sm">
      <q-toggle
        v-model="required"
        label="Required"
        dense
      />
      <q-toggle
        v-model="disabled"
        label="Disabled"
        dense
      />
    </div>
  </PropertySection>
</template>