<script setup lang="ts">
import { computed } from 'vue'
import type { FormSettings, FormMeta } from '@/types'

interface Props {
  settings: FormSettings
  meta: FormMeta | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:settings': [settings: Partial<FormSettings>]
  'update:meta': [meta: Partial<FormMeta>]
}>()

// Form title (from meta)
const title = computed({
  get: () => props.meta?.title || '',
  set: (value: string) => emit('update:meta', { title: value })
})

// Form description (from meta)
const description = computed({
  get: () => props.meta?.description || '',
  set: (value: string) => emit('update:meta', { description: value || undefined })
})

// Settings computed properties
const submitButtonText = computed({
  get: () => props.settings.submitButtonText || 'Submit',
  set: (value: string) => emit('update:settings', { submitButtonText: value })
})

const successMessage = computed({
  get: () => props.settings.successMessage || 'Thank you for your submission!',
  set: (value: string) => emit('update:settings', { successMessage: value })
})

const redirectUrl = computed({
  get: () => props.settings.redirectUrl || '',
  set: (value: string) => emit('update:settings', { redirectUrl: value || undefined })
})

const allowMultipleSubmissions = computed({
  get: () => props.settings.allowMultipleSubmissions ?? true,
  set: (value: boolean) => emit('update:settings', { allowMultipleSubmissions: value })
})
</script>

<template>
  <div class="form-settings-editor">
    <!-- Form Info Section -->
    <div class="settings-section">
      <div class="section-title">Form Information</div>
      
      <div class="setting-row">
        <label class="setting-label">Form Title</label>
        <q-input
          v-model="title"
          dense
          outlined
          placeholder="My Form"
        />
      </div>

      <div class="setting-row">
        <label class="setting-label">Description</label>
        <q-input
          v-model="description"
          type="textarea"
          dense
          outlined
          rows="2"
          placeholder="Optional description shown to respondents"
        />
      </div>
    </div>

    <!-- Submit Button Section -->
    <div class="settings-section">
      <div class="section-title">Submit Button</div>
      
      <div class="setting-row">
        <label class="setting-label">Button Text</label>
        <q-input
          v-model="submitButtonText"
          dense
          outlined
          placeholder="Submit"
        />
      </div>
    </div>

    <!-- After Submission Section -->
    <div class="settings-section">
      <div class="section-title">After Submission</div>
      
      <div class="setting-row">
        <label class="setting-label">Success Message</label>
        <q-input
          v-model="successMessage"
          type="textarea"
          dense
          outlined
          rows="2"
          placeholder="Thank you for your submission!"
        />
      </div>

      <div class="setting-row">
        <label class="setting-label">
          Redirect URL
          <q-icon name="help_outline" size="14px" class="q-ml-xs text-grey-5">
            <q-tooltip max-width="250px">
              After submission, redirect to this URL instead of showing the success message
            </q-tooltip>
          </q-icon>
        </label>
        <q-input
          v-model="redirectUrl"
          dense
          outlined
          placeholder="https://example.com/thank-you"
          :rules="[
            (v: string) => !v || v.startsWith('http') || 'Must be a valid URL'
          ]"
        />
      </div>

      <div class="setting-row">
        <q-toggle
          v-model="allowMultipleSubmissions"
          label="Allow multiple submissions"
          dense
        />
        <div class="text-caption text-grey q-mt-xs">
          When enabled, respondents can submit the form multiple times
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-settings-editor {
  padding: 4px 0;
}

.settings-section {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  margin-bottom: 12px;
}

.setting-row {
  margin-bottom: 12px;
}

.setting-row:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #444;
  margin-bottom: 4px;
}
</style>