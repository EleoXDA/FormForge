<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { formsService, isSupabaseConfigured } from '@/services'
import { SchemaRenderer } from '@/components/runtime'
import type { FormMeta, FormSchema } from '@/types'

const route = useRoute()

const slug = computed(() => route.params['slug'] as string)
const isConfigured = isSupabaseConfigured()

const isLoading = ref(true)
const loadError = ref<string | null>(null)
const meta = ref<FormMeta | null>(null)
const schema = ref<FormSchema | null>(null)

const formValues = ref<Record<string, unknown>>({})
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitted = ref(false)

const allowMultiple = computed(
  () => schema.value?.settings.allowMultipleSubmissions ?? false
)
const successMessage = computed(
  () => schema.value?.settings.successMessage || 'Thank you for your submission!'
)

/**
 * Load the published form identified by the public slug.
 */
async function loadForm() {
  isLoading.value = true
  loadError.value = null

  if (!isConfigured) {
    loadError.value = 'This form is unavailable because the backend is not configured.'
    isLoading.value = false
    return
  }

  const result = await formsService.getFormBySlug(slug.value)

  if (result.success) {
    meta.value = result.data.meta
    schema.value = result.data.schema
  } else {
    loadError.value = result.error
  }

  isLoading.value = false
}

/**
 * Submit the collected answers to the backend.
 */
async function handleSubmit(values: Record<string, unknown>) {
  if (!meta.value || !schema.value || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = null

  const result = await formsService.submitResponse(
    meta.value.id,
    schema.value.schemaVersion,
    values
  )

  isSubmitting.value = false

  if (result.success) {
    submitted.value = true
    // Optionally redirect after a successful submission
    const redirectUrl = schema.value.settings.redirectUrl
    if (redirectUrl) {
      window.location.href = redirectUrl
    }
  } else {
    submitError.value = result.error
  }
}

/**
 * Reset the form so the respondent can submit another response.
 */
function submitAnother() {
  formValues.value = {}
  submitted.value = false
  submitError.value = null
}

watch(slug, loadForm)
onMounted(loadForm)
</script>

<template>
  <q-page class="public-form-page" padding>
    <div class="public-form-container">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-center q-pa-xl">
        <q-spinner color="primary" size="48px" />
      </div>

      <!-- Error / not found state -->
      <q-banner v-else-if="loadError" class="bg-negative text-white" rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ loadError }}
        <template #action>
          <q-btn flat label="Retry" @click="loadForm" />
        </template>
      </q-banner>

      <!-- Success state -->
      <q-card v-else-if="submitted" flat bordered class="text-center q-pa-xl">
        <q-icon name="check_circle" color="positive" size="64px" />
        <h2 class="text-h5 q-mt-md q-mb-sm">{{ successMessage }}</h2>
        <q-btn
          v-if="allowMultiple"
          color="primary"
          label="Submit another response"
          class="q-mt-md"
          @click="submitAnother"
        />
      </q-card>

      <!-- Form -->
      <q-card v-else-if="schema" flat bordered class="q-pa-lg">
        <h1 class="text-h5 q-mb-xs">{{ meta?.title }}</h1>
        <p v-if="meta?.description" class="text-grey-7 q-mb-lg">
          {{ meta.description }}
        </p>

        <q-banner v-if="submitError" class="bg-negative text-white q-mb-md" rounded dense>
          {{ submitError }}
        </q-banner>

        <SchemaRenderer
          v-model="formValues"
          :schema="schema"
          :disabled="isSubmitting"
          @submit="handleSubmit"
        />
      </q-card>
    </div>
  </q-page>
</template>

<style scoped>
.public-form-page {
  background: #f5f5f5;
}

.public-form-container {
  max-width: 640px;
  margin: 0 auto;
}
</style>