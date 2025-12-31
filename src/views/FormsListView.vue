<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { formsService, isSupabaseConfigured } from '@/services'
import type { FormMeta } from '@/types'

const router = useRouter()
const $q = useQuasar()

const forms = ref<FormMeta[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isConfigured = computed(() => isSupabaseConfigured())

// Dialog state for creating new forms
const showCreateDialog = ref(false)
const newFormTitle = ref('Untitled Form')
const isCreating = ref(false)

/**
 * Load all forms from the database
 */
async function loadForms() {
  if (!isConfigured.value) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  const result = await formsService.getAllForms()
  
  if (result.success) {
    forms.value = result.data
  } else {
    error.value = result.error
  }
  
  isLoading.value = false
}

/**
 * Create a new form and navigate to the builder
 */
async function createForm() {
  if (!newFormTitle.value.trim()) return

  isCreating.value = true
  const result = await formsService.createForm(newFormTitle.value.trim())
  isCreating.value = false

  if (result.success) {
    showCreateDialog.value = false
    newFormTitle.value = 'Untitled Form'
    router.push(`/builder/${result.data.id}`)
  } else {
    $q.notify({
      type: 'negative',
      message: result.error
    })
  }
}

/**
 * Delete a form with confirmation
 */
async function deleteForm(form: FormMeta) {
  $q.dialog({
    title: 'Delete Form',
    message: `Are you sure you want to delete "${form.title}"? This action cannot be undone.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const result = await formsService.deleteForm(form.id)
    
    if (result.success) {
      forms.value = forms.value.filter((f) => f.id !== form.id)
      $q.notify({
        type: 'positive',
        message: 'Form deleted successfully'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: result.error
      })
    }
  })
}

/**
 * Format a date string for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get status color for the badge
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'published': return 'positive'
    case 'archived': return 'grey'
    default: return 'warning'
  }
}

onMounted(loadForms)
</script>

<template>
  <q-page padding>
    <div class="forms-list-page">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <h1 class="text-h4 q-mb-xs">My Forms</h1>
          <p class="text-grey-6">Create and manage your forms</p>
        </div>
        <q-btn
          color="primary"
          icon="add"
          label="Create Form"
          :disable="!isConfigured"
          @click="showCreateDialog = true"
        />
      </div>

      <!-- Supabase not configured warning -->
      <q-banner v-if="!isConfigured" class="bg-warning text-white q-mb-lg" rounded>
        <template #avatar>
          <q-icon name="warning" />
        </template>
        <div class="text-subtitle1">Supabase Not Configured</div>
        <div class="text-body2 q-mt-xs">
          To save forms to a database, please configure your Supabase credentials
          in the <code>.env.local</code> file. See <code>supabase/README.md</code> for instructions.
        </div>
        <template #action>
          <q-btn flat label="Use Demo Mode" to="/builder/demo" />
        </template>
      </q-banner>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center q-pa-xl">
        <q-spinner color="primary" size="48px" />
        <p class="q-mt-md text-grey">Loading forms...</p>
      </div>

      <!-- Error state -->
      <q-banner v-else-if="error" class="bg-negative text-white q-mb-lg" rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat label="Retry" @click="loadForms" />
        </template>
      </q-banner>

      <!-- Empty state -->
      <q-card v-else-if="forms.length === 0 && isConfigured" flat bordered class="text-center q-pa-xl">
        <q-icon name="description" size="64px" color="grey-4" />
        <h3 class="text-h6 text-grey-6 q-mt-md q-mb-sm">No Forms Yet</h3>
        <p class="text-body2 text-grey">Create your first form to get started</p>
        <q-btn
          color="primary"
          label="Create Your First Form"
          class="q-mt-md"
          @click="showCreateDialog = true"
        />
      </q-card>

      <!-- Forms grid -->
      <div v-else class="row q-col-gutter-md">
        <div
          v-for="form in forms"
          :key="form.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card class="form-card" flat bordered>
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-subtitle1 text-weight-medium ellipsis">
                    {{ form.title }}
                  </div>
                  <div class="text-caption text-grey">
                    Updated {{ formatDate(form.updatedAt) }}
                  </div>
                </div>
                <q-badge :color="getStatusColor(form.status)" :label="form.status" />
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <q-btn
                flat
                color="primary"
                label="Edit"
                :to="`/builder/${form.id}`"
              />
              <q-btn
                v-if="form.status === 'published'"
                flat
                color="secondary"
                label="View"
                :to="`/f/${form.slug}`"
              />
              <q-space />
              <q-btn
                flat
                round
                color="negative"
                icon="delete_outline"
                @click="deleteForm(form)"
              >
                <q-tooltip>Delete form</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Create Form Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Create New Form</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newFormTitle"
            label="Form Title"
            autofocus
            outlined
            @keyup.enter="createForm"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateDialog = false" />
          <q-btn
            color="primary"
            label="Create"
            :loading="isCreating"
            :disable="!newFormTitle.trim()"
            @click="createForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.forms-list-page {
  max-width: 1200px;
  margin: 0 auto;
}

.form-card {
  transition: box-shadow 0.2s, transform 0.2s;
}

.form-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
</style>