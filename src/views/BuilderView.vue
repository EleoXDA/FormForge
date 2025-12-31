<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormEditorStore } from '@/stores'
import { BuilderLayout, FieldPalette, BuilderCanvas } from '@/components/builder'
import { PropertyInspector } from '@/components/builder/inspector'
import type { FormField } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useFormEditorStore()

const formId = computed(() => route.params['id'] as string)
const formTitle = computed(() => store.meta?.title || 'Untitled Form')
const isDirty = computed(() => store.isDirty)
const canUndo = computed(() => store.canUndo)
const canRedo = computed(() => store.canRedo)

onMounted(() => {
  // If no form is loaded, create a new one
  if (!store.meta || store.meta.id !== formId.value) {
    store.createNewForm('New Form')
  }
})

function handleUndo() {
  store.undo()
}

function handleRedo() {
  store.redo()
}

function handlePreview() {
  router.push(`/preview/${formId.value}`)
}

function handleFieldUpdate(updates: Partial<FormField>) {
  if (store.selectedFieldId) {
    store.updateField(store.selectedFieldId, updates)
  }
}

function handleSave() {
  // TODO: Implement actual save to backend
  store.markAsSaved()
  console.log('Form saved:', store.schema)
}
</script>

<template>
  <BuilderLayout>
    <!-- Title slot -->
    <template #title>
      <div class="flex items-center">
        <span>{{ formTitle }}</span>
        <q-badge v-if="isDirty" color="orange" class="q-ml-sm">Unsaved</q-badge>
      </div>
    </template>

    <!-- Toolbar actions -->
    <template #toolbar-actions>
      <q-btn
        flat
        round
        dense
        icon="undo"
        :disable="!canUndo"
        @click="handleUndo"
      >
        <q-tooltip>Undo (Ctrl+Z)</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        icon="redo"
        :disable="!canRedo"
        @click="handleRedo"
      >
        <q-tooltip>Redo (Ctrl+Y)</q-tooltip>
      </q-btn>
      <q-separator vertical inset class="q-mx-sm" />
      <q-btn
        flat
        dense
        icon="visibility"
        label="Preview"
        @click="handlePreview"
      />
      <q-btn
        dense
        color="primary"
        icon="save"
        label="Save"
        class="q-ml-sm"
        @click="handleSave"
      />
    </template>

    <!-- Field Palette (left sidebar) -->
    <template #palette>
      <FieldPalette />
    </template>

    <!-- Canvas (center) -->
    <template #canvas>
      <BuilderCanvas />
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
    </template>  </BuilderLayout>
</template>