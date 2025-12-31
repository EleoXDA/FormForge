<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formsService, isSupabaseConfigured } from '@/services'
import type { FormSubmission, FormMeta, FormSchema, FormField } from '@/types'

const route = useRoute()
const router = useRouter()

const formId = computed(() => route.params['id'] as string)

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const formMeta = ref<FormMeta | null>(null)
const formSchema = ref<FormSchema | null>(null)
const submissions = ref<FormSubmission[]>([])
const totalCount = ref(0)

// Pagination
const pagination = ref({
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
})

// Selected submission for detail view
const selectedSubmission = ref<FormSubmission | null>(null)
const showDetailDialog = ref(false)

/**
 * Generate table columns from schema fields
 */
const tableColumns = computed(() => {
  const columns: Array<{
    name: string
    label: string
    field: string | ((row: FormSubmission) => unknown)
    align: 'left' | 'center' | 'right'
    sortable: boolean
  }> = [
    {
      name: 'submittedAt',
      label: 'Submitted',
      field: (row: FormSubmission) => formatDate(row.submittedAt),
      align: 'left',
      sortable: true
    }
  ]

  // Add columns for each field in the schema
  if (formSchema.value) {
    for (const field of formSchema.value.fields.slice(0, 5)) {
      // Limit to first 5 fields
      columns.push({
        name: field.name,
        label: field.label || field.name,
        field: (row: FormSubmission) => formatValue(row.answers[field.name]),
        align: 'left',
        sortable: false
      })
    }
  }

  // Actions column
  columns.push({
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'right',
    sortable: false
  })

  return columns
})

/**
 * Load form metadata and schema
 */
async function loadForm() {
  if (!isSupabaseConfigured()) {
    error.value = 'Database not configured'
    isLoading.value = false
    return
  }

  const result = await formsService.getFormById(formId.value)

  if (result.success) {
    formMeta.value = result.data.meta
    formSchema.value = result.data.schema
  } else {
    error.value = result.error
  }
}

/**
 * Load submissions with pagination
 */
async function loadSubmissions() {
  if (!isSupabaseConfigured()) return

  isLoading.value = true
  error.value = null

  const offset = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const result = await formsService.getSubmissions(formId.value, {
    limit: pagination.value.rowsPerPage,
    offset
  })

  if (result.success) {
    submissions.value = result.data.submissions
    totalCount.value = result.data.total
    pagination.value.rowsNumber = result.data.total
  } else {
    error.value = result.error
  }

  isLoading.value = false
}

/**
 * Handle pagination change from table
 */
function onPaginationChange(props: {
  pagination: {
    sortBy: string
    descending: boolean
    page: number
    rowsPerPage: number
    rowsNumber?: number
  }
  filter?: unknown
  getCellValue: (col: unknown, row: unknown) => unknown
}) {
  pagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: pagination.value.rowsNumber
  }
  loadSubmissions()
}

/**
 * View submission details
 */
function viewSubmission(submission: FormSubmission) {
  selectedSubmission.value = submission
  showDetailDialog.value = true
}

/**
 * Export submissions to CSV
 */
function exportToCsv() {
  if (!formSchema.value || submissions.value.length === 0) return

  const fields = formSchema.value.fields
  const headers = ['Submitted At', ...fields.map((f) => f.label || f.name)]

  const rows = submissions.value.map((sub) => {
    const values = [
      new Date(sub.submittedAt).toISOString(),
      ...fields.map((f) => {
        const val = sub.answers[f.name]
        if (Array.isArray(val)) return val.join('; ')
        if (val === null || val === undefined) return ''
        return String(val)
      })
    ]
    return values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${formMeta.value?.title || 'form'}-submissions.csv`
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Format a date string for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format a value for display in the table
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'

  const str = String(value)
  return str.length > 50 ? str.slice(0, 50) + '...' : str
}

/**
 * Get the label for a field value (for select/radio fields)
 */
function getValueLabel(field: FormField, value: unknown): string {
  if ('options' in field && field.options) {
    const option = field.options.find((o) => o.value === value)
    if (option) return option.label
  }
  return formatValue(value)
}

// Watch for form ID changes
watch(formId, () => {
  loadForm()
  loadSubmissions()
})

onMounted(async () => {
  await loadForm()
  await loadSubmissions()
})
</script>

<template>
  <q-page padding>
    <div class="submissions-page">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <q-btn flat round icon="arrow_back" @click="router.push(`/builder/${formId}`)" />
        <div class="q-ml-md">
          <h1 class="text-h5 q-mb-none">{{ formMeta?.title || 'Form' }} Submissions</h1>
          <p class="text-caption text-grey q-mb-none">{{ totalCount }} total responses</p>
        </div>
        <q-space />
        <q-btn
          outline
          color="primary"
          icon="download"
          label="Export CSV"
          :disable="submissions.length === 0"
          @click="exportToCsv"
        />
      </div>

      <!-- Loading state -->
      <div v-if="isLoading && submissions.length === 0" class="text-center q-pa-xl">
        <q-spinner color="primary" size="48px" />
        <p class="q-mt-md text-grey">Loading submissions...</p>
      </div>

      <!-- Error state -->
      <q-banner v-else-if="error" class="bg-negative text-white q-mb-lg" rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat label="Retry" @click="loadSubmissions" />
        </template>
      </q-banner>

      <!-- Empty state -->
      <q-card v-else-if="submissions.length === 0" flat bordered class="text-center q-pa-xl">
        <q-icon name="inbox" size="64px" color="grey-4" />
        <h3 class="text-h6 text-grey-6 q-mt-md q-mb-sm">No Submissions Yet</h3>
        <p class="text-body2 text-grey">Share your form to start collecting responses</p>
        <q-btn
          color="primary"
          label="Go to Form Builder"
          class="q-mt-md"
          :to="`/builder/${formId}`"
        />
      </q-card>

      <!-- Submissions table -->
      <q-table
        v-else
        :rows="submissions"
        :columns="tableColumns"
        row-key="id"
        :loading="isLoading"
        v-model:pagination="pagination"
        @request="onPaginationChange"
        flat
        bordered
      >
        <!-- Actions column -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="visibility" @click="viewSubmission(props.row)">
              <q-tooltip>View details</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Submission Detail Dialog -->
    <q-dialog v-model="showDetailDialog">
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Submission Details</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showDetailDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="selectedSubmission" class="scroll" style="max-height: 70vh">
          <!-- Metadata -->
          <div class="q-mb-md">
            <div class="text-caption text-grey">Submitted</div>
            <div>{{ formatDate(selectedSubmission.submittedAt) }}</div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Field values -->
          <div v-for="field in formSchema?.fields" :key="field.id" class="q-mb-md">
            <div class="text-caption text-grey">{{ field.label || field.name }}</div>
            <div class="text-body1">
              {{ getValueLabel(field, selectedSubmission.answers[field.name]) || '-' }}
            </div>
          </div>

          <!-- Submission ID -->
          <q-separator class="q-my-md" />
          <div class="text-caption text-grey">Submission ID: {{ selectedSubmission.id }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.submissions-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
