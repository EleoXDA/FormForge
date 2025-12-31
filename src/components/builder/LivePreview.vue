<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SchemaRenderer } from '@/components/runtime'
import type { FormSchema } from '@/types'

interface Props {
  schema: FormSchema
  formTitle?: string
}

const props = defineProps<Props>()

// Preview form values (separate from actual submission)
const previewValues = ref<Record<string, unknown>>({})

// Device preview mode
type DeviceMode = 'desktop' | 'tablet' | 'mobile'
const deviceMode = ref<DeviceMode>('desktop')

const deviceWidth = computed(() => {
  switch (deviceMode.value) {
    case 'mobile': return '375px'
    case 'tablet': return '768px'
    default: return '100%'
  }
})

// Reset preview values when schema changes significantly
watch(
  () => props.schema.fields.map(f => f.id).join(','),
  () => {
    previewValues.value = {}
  }
)

function handlePreviewSubmit(values: Record<string, unknown>) {
  // In preview mode, just log the values
  console.log('Preview submission:', values)
}
</script>

<template>
  <div class="live-preview">
    <!-- Preview Header -->
    <div class="preview-header">
      <span class="preview-title">Live Preview</span>
      <div class="device-toggles">
        <q-btn-toggle
          v-model="deviceMode"
          flat
          dense
          toggle-color="primary"
          :options="[
            { value: 'desktop', icon: 'computer' },
            { value: 'tablet', icon: 'tablet_mac' },
            { value: 'mobile', icon: 'smartphone' }
          ]"
        />
      </div>
    </div>

    <!-- Preview Container -->
    <div class="preview-container">
      <div 
        class="preview-frame"
        :style="{ maxWidth: deviceWidth }"
      >
        <!-- Empty State -->
        <div v-if="props.schema.fields.length === 0" class="preview-empty">
          <q-icon name="preview" size="48px" color="grey-4" />
          <p class="q-mt-md text-grey-6">Add fields to see your form preview</p>
        </div>

        <!-- Form Preview -->
        <div v-else class="preview-form">
          <h2 v-if="props.formTitle" class="text-h5 q-mb-md">
            {{ props.formTitle }}
          </h2>
          <SchemaRenderer
            :schema="props.schema"
            v-model="previewValues"
            @submit="handlePreviewSubmit"
          />
        </div>
      </div>
    </div>

    <!-- Preview Footer -->
    <div class="preview-footer">
      <q-icon name="info" size="14px" color="grey-5" class="q-mr-xs" />
      <span class="text-caption text-grey-6">
        This preview shows how your form will appear to respondents
      </span>
    </div>
  </div>
</template>

<style scoped>
.live-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.preview-frame {
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: max-width 0.3s ease;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.preview-form {
  max-width: 100%;
}

.preview-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: white;
  border-top: 1px solid #e8e8e8;
}
</style>