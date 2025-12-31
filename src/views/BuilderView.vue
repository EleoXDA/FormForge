<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFormEditorStore } from '@/stores'
import { formsService, isSupabaseConfigured } from '@/services'
import { 
  BuilderLayout, 
  FieldPalette, 
  BuilderCanvas, 
  LivePreview, 
  FormSettingsEditor,
  SaveStatusIndicator 
} from '@/components/builder'
import { PropertyInspector } from '@/components/builder/inspector'
import { useBuilderKeyboard, useAutoSave } from '@/composables'
import type { FormField, FormSchema, FormMeta } from '@/types'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useFormEditorStore()

// Enable keyboard shortcuts
useBuilderKeyboard()

const formId = computed(() => route.params['id'] as string)
const formTitle = computed(() => store.meta?.title || 'Untitled Form')
const isDirty = computed(() => store.isDirty)
const canUndo = computed(() => store.canUndo)
const canRedo = computed(() => store.canRedo)

const isLoading = ref(false)
const isSaving = ref(false)
const loadError = ref<string | null>(null)
const isConfigured = isSupabaseConfigured()

// Auto-save setup
const autoSaveEnabled = computed(() => isConfigured && !!store.meta?.id)

const { status: saveStatus, lastSavedAt, error: saveError, trigger: triggerAutoSave } = useAutoSave({
  debounceMs: 3000,
  enabled: autoSaveEnabled,
  onSave: async () => {
    if (!store.meta?.id) return
    const result = await formsService.saveVersion(store.meta.id, store.schema)
    if (!result.success) {
      throw new Error(result.error)
    }
    store.markAsSaved()
  }
})

// Watch for schema changes to trigger auto-save
watch(
  () => store.schema,
  () => {
    if (store.isDirty) {
      triggerAutoSave()
    }
  },
  { deep: true }
)

// Settings dialog state
const showSettingsDialog = ref(false)

/**
 * Load form from database or create new
 */
async function loadForm() {
  const id = formId.value

  // Special case: demo mode (no backend)
  if (id === 'demo' || id === 'new' || !isConfigured) {
    if (!store.meta || store.meta.id !== id) {
      store.createNewForm('Demo Form')
    }
    return
  }

  isLoading.value = true
  loadError.value = null

  const result = await formsService.getFormById(id)

  if (result.success) {
    store.loadForm(result.data.meta, result.data.schema)
  } else {
    loadError.value = result.error
    // Fallback to local mode if form not found
    if (!store.meta) {
      store.createNewForm('New Form')
    }
  }

  isLoading.value = false
}

/**
 * Save the current form to the database
 */
async function handleSave() {
  if (!isConfigured) {
    $q.notify({
      type: 'warning',
      message: 'Database not configured. Changes are saved locally only.'
    })
    store.markAsSaved()
    return
  }

  if (!store.meta?.id) return

  isSaving.value = true

  // Save new version
  const result = await formsService.saveVersion(store.meta.id, store.schema)

  if (result.success) {
    store.markAsSaved()
    $q.notify({
      type: 'positive',
      message: `Saved as version ${result.data}`
    })
  } else {
    $q.notify({
      type: 'negative',
      message: result.error
    })
  }

  isSaving.value = false
}

/**
 * Publish the form (update status and save)
 */
async function handlePublish() {
  if (!isConfigured || !store.meta?.id) return

  // First save the current version
  await handleSave()

  // Then update status to published
  const result = await formsService.updateForm(store.meta.id, { status: 'published' })

  if (result.success) {
    if (store.meta) {
      store.meta.status = 'published'
    }
    $q.notify({
      type: 'positive',
      message: 'Form published successfully!'
    })
  } else {
    $q.notify({
      type: 'negative',
      message: result.error
    })
  }
}

function handleUndo() {
  store.undo()
}

function handleRedo() {
  store.redo()
}

function handlePreview() {
  router.push(`/preview/${formId.value}`)
}

function handleSettingsUpdate(updates: Partial<FormSchema['settings']>) {
  store.updateSettings(updates)
}

function handleMetaUpdate(updates: Partial<FormMeta>) {
  if (store.meta) {
    Object.assign(store.meta, updates)
    store.isDirty = true
  }
}

function handleFieldUpdate(updates: Partial<FormField>) {
  if (store.selectedFieldId) {
    store.updateField(store.selectedFieldId, updates)
  }
}

// Watch for route changes to load different forms
watch(formId, loadForm)

onMounted(loadForm)
</script>

<template>
  <BuilderLayout>
    <!-- Title slot -->
    <template #title>
      <div class="flex items-center">
        <q-btn flat round dense icon="arrow_back" class="q-mr-sm" to="/forms" />
        <span>{{ formTitle }}</span>
        <q-badge v-if="isDirty" color="orange" class="q-ml-sm">Unsaved</q-badge>
        <q-badge v-if="store.meta?.status === 'published'" color="positive" class="q-ml-sm">
          Published
        </q-badge>
      </div>
    </template>

    <!-- Toolbar actions -->
    <template #toolbar-actions>
      <SaveStatusIndicator
        v-if="isConfigured"
        :status="saveStatus"
        :last-saved-at="lastSavedAt"
        :error="saveError"
        class="q-mr-sm"
      />
      <q-btn flat round dense icon="undo" :disable="!canUndo" @click="handleUndo">
        <q-tooltip>Undo (Ctrl+Z)</q-tooltip>
      </q-btn>
      <q-btn flat round dense icon="redo" :disable="!canRedo" @click="handleRedo">
        <q-tooltip>Redo (Ctrl+Y)</q-tooltip>
      </q-btn>
      <q-separator vertical inset class="q-mx-sm" />
      <q-btn flat dense icon="visibility" label="Preview" @click="handlePreview" />
      <q-btn
        dense
        color="primary"
        icon="save"
        label="Save"
        :loading="isSaving || saveStatus === 'saving'"
        :disable="!isDirty && saveStatus !== 'error'"
        class="q-ml-sm"
        @click="handleSave"
      />
      <q-btn flat dense icon="settings" class="q-ml-sm" @click="showSettingsDialog = true">
        <q-tooltip>Form Settings</q-tooltip>
      </q-btn>
      <q-btn
        v-if="store.meta?.status !== 'published'"
        dense
        color="positive"
        icon="publish"
        label="Publish"
        class="q-ml-sm"
        @click="handlePublish"
      />
    </template>

    <!-- Field Palette (left sidebar) -->
    <template #palette>
      <FieldPalette />
    </template>

    <!-- Canvas (center) -->
    <template #canvas>
      <!-- Loading state -->
      <div v-if="isLoading" class="flex flex-center q-pa-xl">
        <q-spinner color="primary" size="48px" />
      </div>

      <!-- Error state -->
      <div v-else-if="loadError" class="q-pa-lg">
        <q-banner class="bg-negative text-white" rounded>
          <template #avatar>
            <q-icon name="error" />
          </template>
          {{ loadError }}
          <template #action>
            <q-btn flat label="Retry" @click="loadForm" />
            <q-btn flat label="Create New" @click="store.createNewForm('New Form')" />
          </template>
        </q-banner>
      </div>

      <!-- Canvas -->
      <BuilderCanvas v-else />
    </template>

    <!-- Inspector (right sidebar) -->
    <template #inspector>
      <PropertyInspector
        v-if="store.selectedField"
        :field="store.selectedField"
        @update:field="handleFieldUpdate"
      />
      <div v-else class="text-center text-grey q-pa-lg">
        <q-icon name="touch_app" size="48px" color="grey-4" />
        <p class="q-mt-md">Select a field to edit its properties</p>
      </div>
    </template>
    <!-- Live Preview (right sidebar alternative) -->
    <template #preview>
      <LivePreview :schema="store.schema" :form-title="store.meta?.title" />
    </template>
    <!-- Settings Dialog -->
    <q-dialog v-model="showSettingsDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Form Settings</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="showSettingsDialog = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="scroll" style="max-height: 70vh">
          <FormSettingsEditor
            :settings="store.schema.settings"
            :meta="store.meta"
            @update:settings="handleSettingsUpdate"
            @update:meta="handleMetaUpdate"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showSettingsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </BuilderLayout>
</template>
