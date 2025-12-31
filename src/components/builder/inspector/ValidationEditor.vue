<script setup lang="ts">
import { computed } from 'vue'
import type { ValidationRules } from '@/types'
import PropertySection from './PropertySection.vue'
import PropertyRow from './PropertyRow.vue'

interface Props {
  validation: ValidationRules | undefined
  fieldType: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:validation': [validation: ValidationRules | undefined]
}>()

// Determine which validation options to show based on field type
const showMinMaxLength = computed(() => 
  ['text', 'email', 'textarea', 'phone'].includes(props.fieldType)
)

const showMinMax = computed(() => props.fieldType === 'number')

const showPattern = computed(() => 
  ['text', 'email', 'phone'].includes(props.fieldType)
)

// Helper to update a single validation property
function updateValidation(key: keyof ValidationRules, value: unknown) {
  const current = props.validation || {}
  const updated = { ...current, [key]: value || undefined }
  
  // Clean up undefined values
  const cleaned = Object.fromEntries(
    Object.entries(updated).filter(([_, v]) => v !== undefined && v !== '')
  ) as ValidationRules
  
  emit('update:validation', Object.keys(cleaned).length > 0 ? cleaned : undefined)
}

// Computed getters for each validation property
const minLength = computed({
  get: () => props.validation?.minLength ?? null,
  set: (v) => updateValidation('minLength', v ? Number(v) : undefined)
})

const maxLength = computed({
  get: () => props.validation?.maxLength ?? null,
  set: (v) => updateValidation('maxLength', v ? Number(v) : undefined)
})

const min = computed({
  get: () => props.validation?.min ?? null,
  set: (v) => updateValidation('min', v !== null ? Number(v) : undefined)
})

const max = computed({
  get: () => props.validation?.max ?? null,
  set: (v) => updateValidation('max', v !== null ? Number(v) : undefined)
})

const pattern = computed({
  get: () => props.validation?.pattern ?? '',
  set: (v) => updateValidation('pattern', v || undefined)
})

const patternMessage = computed({
  get: () => props.validation?.patternMessage ?? '',
  set: (v) => updateValidation('patternMessage', v || undefined)
})
</script>

<template>
  <PropertySection title="Validation" :default-open="false">
    <!-- Min/Max Length for text fields -->
    <template v-if="showMinMaxLength">
      <div class="row q-gutter-sm">
        <div class="col">
          <PropertyRow label="Min Length">
            <q-input
              v-model.number="minLength"
              type="number"
              dense
              outlined
              :min="0"
              placeholder="0"
            />
          </PropertyRow>
        </div>
        <div class="col">
          <PropertyRow label="Max Length">
            <q-input
              v-model.number="maxLength"
              type="number"
              dense
              outlined
              :min="0"
              placeholder="∞"
            />
          </PropertyRow>
        </div>
      </div>
    </template>

    <!-- Min/Max for number fields -->
    <template v-if="showMinMax">
      <div class="row q-gutter-sm">
        <div class="col">
          <PropertyRow label="Minimum">
            <q-input
              v-model.number="min"
              type="number"
              dense
              outlined
              placeholder="-∞"
            />
          </PropertyRow>
        </div>
        <div class="col">
          <PropertyRow label="Maximum">
            <q-input
              v-model.number="max"
              type="number"
              dense
              outlined
              placeholder="∞"
            />
          </PropertyRow>
        </div>
      </div>
    </template>

    <!-- Pattern for text-like fields -->
    <template v-if="showPattern">
      <PropertyRow label="Pattern (Regex)" hint="Regular expression to validate against">
        <q-input
          v-model="pattern"
          dense
          outlined
          placeholder="^[A-Z]{2}[0-9]{4}$"
        />
      </PropertyRow>

      <PropertyRow v-if="pattern" label="Pattern Error Message">
        <q-input
          v-model="patternMessage"
          dense
          outlined
          placeholder="Value doesn't match the required format"
        />
      </PropertyRow>
    </template>

    <!-- No validation options available -->
    <div
      v-if="!showMinMaxLength && !showMinMax && !showPattern"
      class="text-caption text-grey text-center q-py-sm"
    >
      No validation options for this field type
    </div>
  </PropertySection>
</template>