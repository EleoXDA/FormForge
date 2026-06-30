<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { FileField, FileReference } from '@/types'
import { uploadFormFile, validateFile, formatFileSize } from '@/services'
import { formUploadContextKey } from '../uploadContext'

interface Props {
  field: FileField
  modelValue: FileReference | null
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: FileReference | null]
}>()

const uploadCtx = inject(formUploadContextKey, { enabled: false })

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const progress = ref(0)
const localError = ref<string | null>(null)

const uploadsEnabled = computed(() => uploadCtx.enabled && !!uploadCtx.formId)
const hasFile = computed(() => !!props.modelValue)
const displayError = computed(() => props.error || localError.value || undefined)

const constraintHint = computed(() => {
  const parts: string[] = []
  if (props.field.accept) parts.push(props.field.accept)
  if (props.field.maxSizeMb) parts.push(`up to ${props.field.maxSizeMb} MB`)
  return parts.join(' · ')
})

// QField-style required rule that checks the emitted file reference.
const rules = computed(() =>
  props.field.required ? [() => hasFile.value || 'This field is required'] : []
)

async function onFileSelected(file: File | null) {
  localError.value = null

  if (!file) {
    selectedFile.value = null
    return
  }

  const validationError = validateFile(file, {
    accept: props.field.accept,
    maxSizeMb: props.field.maxSizeMb
  })
  if (validationError) {
    localError.value = validationError
    selectedFile.value = null
    return
  }

  if (!uploadsEnabled.value || !uploadCtx.formId) {
    localError.value = 'File uploads are not available for this form.'
    selectedFile.value = null
    return
  }

  selectedFile.value = file
  uploading.value = true
  progress.value = 0

  const result = await uploadFormFile(uploadCtx.formId, file, (fraction) => {
    progress.value = fraction
  })

  uploading.value = false

  if (result.success) {
    emit('update:modelValue', result.data)
  } else {
    localError.value = result.error
    selectedFile.value = null
  }
}

function removeFile() {
  selectedFile.value = null
  progress.value = 0
  localError.value = null
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="file-field">
    <div class="text-body2 q-mb-xs">
      {{ props.field.label }}
      <span v-if="props.field.required" class="text-negative">*</span>
    </div>
    <div v-if="props.field.helpText" class="text-caption text-grey-7 q-mb-xs">
      {{ props.field.helpText }}
    </div>

    <!-- Uploaded file -->
    <q-banner v-if="hasFile" dense class="bg-grey-2 rounded-borders file-field__uploaded">
      <template #avatar>
        <q-icon name="insert_drive_file" color="primary" />
      </template>
      <div class="ellipsis">{{ props.modelValue?.name }}</div>
      <div class="text-caption text-grey-7">
        {{ formatFileSize(props.modelValue?.size ?? 0) }}
      </div>
      <template #action>
        <q-btn
          flat
          dense
          round
          icon="close"
          :disable="props.field.disabled"
          @click="removeFile"
        >
          <q-tooltip>Remove file</q-tooltip>
        </q-btn>
      </template>
    </q-banner>

    <!-- File picker -->
    <template v-else>
      <q-file
        :model-value="selectedFile"
        :accept="props.field.accept"
        :disable="props.field.disabled || uploading || !uploadsEnabled"
        :error="!!displayError"
        :error-message="displayError"
        :rules="rules"
        :label="uploadsEnabled ? 'Choose a file' : 'File uploads unavailable'"
        outlined
        dense
        clearable
        @update:model-value="onFileSelected"
      >
        <template #prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>

      <q-linear-progress
        v-if="uploading"
        :value="progress"
        color="primary"
        rounded
        size="6px"
        class="q-mt-sm"
      />

      <div v-if="constraintHint" class="text-caption text-grey-6 q-mt-xs">
        {{ constraintHint }}
      </div>
      <div v-else-if="!uploadsEnabled" class="text-caption text-orange-9 q-mt-xs">
        File uploads require a configured backend.
      </div>
    </template>
  </div>
</template>

<style scoped>
.file-field__uploaded {
  border: 1px solid #e0e0e0;
}
</style>
