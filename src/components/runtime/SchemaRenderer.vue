<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, provide } from 'vue'
import type { FormSchema, FormField } from '@/types'
import { fieldComponentMap } from './fields'
import { formUploadContextKey, type FormUploadContext } from './uploadContext'
import { isUploadEnabled } from '@/services'
import {
  isMultiStep,
  groupFieldsBySteps,
  isFieldVisible,
  isFieldRequired,
  isFieldDisabled,
  filterVisibleAnswers
} from '@/utils'

interface Props {
  schema: FormSchema
  modelValue: Record<string, unknown>
  errors?: Record<string, string>
  disabled?: boolean
  /** When set, in-progress answers and the active step are saved to localStorage. */
  storageKey?: string
  /** 1-based step to open initially (deep links into a wizard step). */
  initialStep?: number
  /** Form id used to scope uploaded files (enables file fields). */
  formId?: string
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  disabled: false,
  storageKey: undefined,
  initialStep: undefined,
  formId: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: [values: Record<string, unknown>]
  'step-change': [step: number]
}>()

// Provide an upload context so file fields can resolve their target form.
const uploadContext = reactive<FormUploadContext>({
  formId: props.formId,
  enabled: isUploadEnabled()
})
watch(
  () => props.formId,
  (id) => {
    uploadContext.formId = id
  }
)
provide(formUploadContextKey, uploadContext)

const rootEl = ref<HTMLElement | null>(null)

// ----- Wizard (multi-step) state -----
const isWizard = computed(() => isMultiStep(props.schema))
const stepGroups = computed(() => groupFieldsBySteps(props.schema))
const totalSteps = computed(() => stepGroups.value.length)
const currentStepIndex = ref(0)
const currentStep = computed(() => stepGroups.value[currentStepIndex.value])
const isLastStep = computed(
  () => !isWizard.value || currentStepIndex.value >= totalSteps.value - 1
)

// ----- Step helpers -----
function clampStepIndex(index: number): number {
  return Math.min(Math.max(index, 0), Math.max(totalSteps.value - 1, 0))
}

/** Convert a 1-based step number (e.g. from a URL) to a 0-based index. */
function toStepIndex(step: number | undefined): number | null {
  if (typeof step !== 'number' || !Number.isFinite(step) || step < 1) return null
  return Math.floor(step) - 1
}

// Keep the active step in range if the schema changes (e.g. while editing).
watch(totalSteps, (count) => {
  if (currentStepIndex.value > count - 1) {
    currentStepIndex.value = Math.max(0, count - 1)
  }
})

// React to deep-link changes (e.g. browser back/forward updating the URL).
watch(
  () => props.initialStep,
  (step) => {
    const index = toStepIndex(step)
    if (index !== null && isWizard.value) {
      const clamped = clampStepIndex(index)
      if (clamped !== currentStepIndex.value) {
        currentStepIndex.value = clamped
      }
    }
  }
)

// Notify the host so it can reflect the active step in the URL (deep links).
watch(currentStepIndex, (index) => {
  if (isWizard.value) {
    emit('step-change', index + 1)
  }
})

/**
 * Fields to render for the current view (whole form, or the active step),
 * filtered by conditional-logic visibility with effective required/disabled
 * so the field renderers honour requiredIf / disableIf rules.
 */
const renderFields = computed<FormField[]>(() => {
  const base = isWizard.value ? (currentStep.value?.fields ?? []) : props.schema.fields
  return base
    .filter((field) => isFieldVisible(field, props.schema, props.modelValue))
    .map(
      (field) =>
        ({
          ...field,
          required: isFieldRequired(field, props.schema, props.modelValue),
          disabled: props.disabled || isFieldDisabled(field, props.schema, props.modelValue)
        }) as FormField
    )
})

const submitButtonText = computed(() => props.schema.settings.submitButtonText || 'Submit')
const primaryLabel = computed(() =>
  isWizard.value && !isLastStep.value ? 'Next' : submitButtonText.value
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
  if (field.type === 'file') return null
  return ''
}

function updateFieldValue(field: FormField, value: unknown) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field.name]: value
  })
}

function scrollToTop() {
  try {
    rootEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch {
    // scrollIntoView may be unavailable in some environments
  }
}

function goBack() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    scrollToTop()
  }
}

/**
 * QForm only fires submit after the mounted (current-step) fields validate,
 * so this advances the wizard or performs the final submission.
 */
function handleSubmit() {
  if (isWizard.value && !isLastStep.value) {
    currentStepIndex.value++
    scrollToTop()
    return
  }
  clearProgress()
  emit('submit', filterVisibleAnswers(props.schema, props.modelValue))
}

// ----- Local progress persistence (opt-in via storageKey) -----
function persistProgress() {
  if (!props.storageKey) return
  try {
    window.localStorage.setItem(
      props.storageKey,
      JSON.stringify({ answers: props.modelValue, step: currentStepIndex.value })
    )
  } catch {
    // ignore storage errors (quota, private mode)
  }
}

function clearProgress() {
  if (!props.storageKey) return
  try {
    window.localStorage.removeItem(props.storageKey)
  } catch {
    // ignore storage errors
  }
}

onMounted(() => {
  let restoredStep: number | null = null

  // Restore saved answers/step from localStorage (opt-in via storageKey).
  if (props.storageKey) {
    try {
      const raw = window.localStorage.getItem(props.storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as { answers?: Record<string, unknown>; step?: number }
        if (saved.answers && typeof saved.answers === 'object') {
          emit('update:modelValue', { ...props.modelValue, ...saved.answers })
        }
        if (typeof saved.step === 'number' && saved.step >= 0) {
          restoredStep = saved.step
        }
      }
    } catch {
      // ignore corrupted storage
    }
  }

  // An explicit deep link (initialStep, 1-based) wins over saved progress.
  const deepLinkIndex = toStepIndex(props.initialStep)
  const target = deepLinkIndex ?? restoredStep
  if (target !== null && isWizard.value) {
    currentStepIndex.value = clampStepIndex(target)
  }
})

watch(() => [props.modelValue, currentStepIndex.value], persistProgress, { deep: true })
</script>

<template>
  <div ref="rootEl" class="schema-renderer-root">
    <q-form class="schema-renderer" @submit.prevent="handleSubmit">
      <!-- Wizard progress header -->
      <div v-if="isWizard && totalSteps > 1" class="wizard-progress q-mb-md">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-subtitle1 text-weight-medium">{{ currentStep?.step.title }}</div>
          <div class="text-caption text-grey-7">
            Step {{ currentStepIndex + 1 }} of {{ totalSteps }}
          </div>
        </div>
        <q-linear-progress
          :value="(currentStepIndex + 1) / totalSteps"
          rounded
          size="6px"
          color="primary"
        />
        <div v-if="currentStep?.step.description" class="text-caption text-grey-7 q-mt-xs">
          {{ currentStep.step.description }}
        </div>
      </div>

      <div v-for="field in renderFields" :key="field.id" class="q-mb-md">
        <component
          :is="getFieldComponent(field)"
          :field="field"
          :model-value="getFieldValue(field)"
          :error="props.errors[field.name]"
          :disabled="field.disabled"
          @update:model-value="(v: unknown) => updateFieldValue(field, v)"
        />
      </div>

      <div class="q-mt-lg row items-center q-gutter-sm">
        <q-btn
          v-if="isWizard && currentStepIndex > 0"
          flat
          color="primary"
          icon="arrow_back"
          label="Back"
          :disable="props.disabled"
          @click="goBack"
        />
        <q-space v-if="isWizard" />
        <q-btn
          type="submit"
          color="primary"
          :label="primaryLabel"
          :icon-right="isWizard && !isLastStep ? 'arrow_forward' : undefined"
          :disable="props.disabled"
        />
      </div>
    </q-form>
  </div>
</template>

<style scoped>
.schema-renderer {
  max-width: 600px;
}
</style>