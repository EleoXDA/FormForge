<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SchemaRenderer } from '@/components/runtime'
import { useFormEditorStore } from '@/stores'
import { formsService, isSupabaseConfigured } from '@/services'
import { createEmptySchema } from '@/utils'
import type { FormSchema } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useFormEditorStore()

const formId = computed(() => route.params['id'] as string)
const isConfigured = isSupabaseConfigured()

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const schema = ref<FormSchema>(createEmptySchema())
const formTitle = ref<string>('Untitled Form')

const formValues = ref<Record<string, unknown>>({})
const submitted = ref(false)

const successMessage = computed(
  () => schema.value.settings.successMessage || 'Thank you for your submission!'
)
const hasFields = computed(() => schema.value.fields.length > 0)

/**
 * Load the schema to preview. Prefer the form currently open in the editor
 * (kept in the persisted store); otherwise fetch it from the backend by id.
 */
async function loadPreview() {
  isLoading.value = true
  loadError.value = null

  const id = formId.value

  // Use the in-editor form when it matches the requested id (covers demo mode).
  if (store.meta && (store.meta.id === id || id === 'demo' || id === 'new')) {
    schema.value = store.schema
    formTitle.value = store.meta.title
    isLoading.value = false
    return
  }

  // Otherwise fetch the form from the backend.
  if (isConfigured && id) {
    const result = await formsService.getFormById(id)
    if (result.success) {
      schema.value = result.data.schema
      formTitle.value = result.data.meta.title
    } else {
      loadError.value = result.error
    }
  } else {
    loadError.value = 'No form to preview. Open a form in the builder first.'
  }

  isLoading.value = false
}

function handleSubmit(values: Record<string, unknown>) {
  // Preview only: surface the collected values without persisting them.
  formValues.value = values
  submitted.value = true
}

function resetPreview() {
  formValues.value = {}
  submitted.value = false
}

function backToBuilder() {
  router.push(`/builder/${formId.value}`)
}

watch(formId, loadPreview)
onMounted(loadPreview)
</script>

<template>
  <q-page padding>
    <div class="preview-page">
      <div class="row items-center q-mb-lg">
        <q-btn flat round icon="arrow_back" @click="backToBuilder">
          <q-tooltip>Back to builder</q-tooltip>
        </q-btn>
        <div class="q-ml-md">
          <h2 class="text-h5 q-mb-none">Form Preview</h2>
          <p class="text-caption text-grey q-mb-none">
            This is how your form will appear to respondents
          </p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-center q-pa-xl">
        <q-spinner color="primary" size="48px" />
      </div>

      <!-- Error state -->
      <q-banner v-else-if="loadError" class="bg-negative text-white" rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ loadError }}
        <template #action>
          <q-btn flat label="Retry" @click="loadPreview" />
        </template>
      </q-banner>

      <!-- Submitted (preview success) -->
      <q-card v-else-if="submitted" class="q-pa-lg text-center" style="max-width: 650px">
        <q-icon name="check_circle" color="positive" size="64px" />
        <h3 class="text-h5 q-mt-md">{{ successMessage }}</h3>
        <q-btn class="q-mt-md" color="primary" label="Submit Another" @click="resetPreview" />
      </q-card>

      <!-- Empty form -->
      <q-card
        v-else-if="!hasFields"
        flat
        bordered
        class="text-center q-pa-xl"
        style="max-width: 650px"
      >
        <q-icon name="preview" size="64px" color="grey-4" />
        <h3 class="text-h6 text-grey-6 q-mt-md q-mb-sm">Nothing to preview yet</h3>
        <p class="text-body2 text-grey">Add fields in the builder to see them here</p>
        <q-btn color="primary" label="Go to Builder" class="q-mt-md" @click="backToBuilder" />
      </q-card>

      <!-- Form preview -->
      <q-card v-else class="q-pa-lg" style="max-width: 650px">
        <h1 v-if="formTitle" class="text-h5 q-mb-md">{{ formTitle }}</h1>
        <SchemaRenderer v-model="formValues" :schema="schema" @submit="handleSubmit" />
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.preview-page {
  max-width: 1000px;
  margin: 0 auto;
}
</style>