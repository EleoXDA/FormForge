<script setup lang="ts">
import { ref } from 'vue'
import { SchemaRenderer } from '@/components/runtime'
import type { FormSchema } from '@/types'

const sampleSchema: FormSchema = {
  schemaVersion: 1,
  settings: {
    submitButtonText: 'Submit Form',
    successMessage: 'Thank you!'
  },
  fields: [
    {
      id: 'field_1',
      type: 'text',
      name: 'fullName',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      required: true
    },
    {
      id: 'field_2',
      type: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'you@example.com',
      required: true
    },
    {
      id: 'field_3',
      type: 'select',
      name: 'department',
      label: 'Department',
      options: [
        { value: 'engineering', label: 'Engineering' },
        { value: 'design', label: 'Design' },
        { value: 'marketing', label: 'Marketing' }
      ]
    },
    {
      id: 'field_4',
      type: 'textarea',
      name: 'message',
      label: 'Message',
      placeholder: 'Tell us more...',
      rows: 4
    },
    {
      id: 'field_5',
      type: 'checkbox',
      name: 'subscribe',
      label: 'Subscribe to newsletter'
    }
  ]
}

const formValues = ref<Record<string, unknown>>({})
const submitted = ref(false)

function handleSubmit(values: Record<string, unknown>) {
  console.log('Form submitted:', values)
  submitted.value = true
}
</script>

<template>
  <q-page padding>
    <div class="q-mb-lg">
      <h2 class="text-h4 q-mb-sm">Form Preview</h2>
      <p class="text-grey">Test the runtime renderer with a sample schema</p>
    </div>

    <q-card v-if="!submitted" class="q-pa-lg" style="max-width: 650px">
      <SchemaRenderer
        v-model="formValues"
        :schema="sampleSchema"
        @submit="handleSubmit"
      />
    </q-card>

    <q-card v-else class="q-pa-lg text-center" style="max-width: 650px">
      <q-icon name="check_circle" color="positive" size="64px" />
      <h3 class="text-h5 q-mt-md">{{ sampleSchema.settings.successMessage }}</h3>
      <q-btn class="q-mt-md" color="primary" label="Submit Another" @click="submitted = false" />
    </q-card>

    <q-card class="q-pa-md q-mt-lg" style="max-width: 650px">
      <div class="text-subtitle2 q-mb-sm">Current Form Values:</div>
      <pre class="text-caption">{{ JSON.stringify(formValues, null, 2) }}</pre>
    </q-card>
  </q-page>
</template>