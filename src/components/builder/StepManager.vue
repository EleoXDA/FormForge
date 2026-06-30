<script setup lang="ts">
import { computed } from 'vue'
import { useFormEditorStore } from '@/stores'
import { isMultiStep } from '@/utils'
import type { FormField } from '@/types'

const store = useFormEditorStore()

/**
 * Two-way toggle that enables/disables wizard mode on the current schema.
 */
const enabled = computed({
  get: () => isMultiStep(store.schema),
  set: (value: boolean) => {
    if (value) {
      store.enableMultiStep()
    } else {
      store.disableMultiStep()
    }
  }
})

const steps = computed(() => store.schema.steps ?? [])
const fields = computed(() => store.schema.fields)

const stepOptions = computed(() =>
  steps.value.map((step) => ({ label: step.title || 'Untitled step', value: step.id }))
)

/**
 * Step a field is currently assigned to, defaulting to the first step when
 * the field has no explicit assignment (matching runtime behaviour).
 */
function fieldStepId(field: FormField): string | undefined {
  return field.stepId ?? steps.value[0]?.id
}

function fieldLabel(field: FormField): string {
  return field.label || field.name || field.type
}

function onStepTitle(stepId: string, title: unknown) {
  store.updateStep(stepId, { title: typeof title === 'string' ? title : String(title ?? '') })
}

function onAssign(fieldId: string, stepId: unknown) {
  if (typeof stepId === 'string') {
    store.assignFieldToStep(fieldId, stepId)
  }
}
</script>

<template>
  <div class="step-manager">
    <q-toggle v-model="enabled" label="Enable multi-step (wizard) form" color="primary" />
    <div class="text-caption text-grey-7 q-mb-md">
      Split your form into multiple steps. Respondents move through them with Next / Back, and
      each step is validated before they continue.
    </div>

    <template v-if="enabled">
      <!-- Steps -->
      <div class="text-subtitle2 q-mb-sm">Steps</div>
      <q-list bordered separator class="rounded-borders q-mb-md">
        <q-item v-for="(step, index) in steps" :key="step.id">
          <q-item-section avatar>
            <q-avatar size="28px" color="primary" text-color="white">{{ index + 1 }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-input
              :model-value="step.title"
              dense
              outlined
              placeholder="Step title"
              @update:model-value="(v: unknown) => onStepTitle(step.id, v)"
            />
          </q-item-section>
          <q-item-section side>
            <div class="row items-center no-wrap">
              <q-btn
                flat
                round
                dense
                icon="keyboard_arrow_up"
                :disable="index === 0"
                @click="store.moveStep(index, index - 1)"
              >
                <q-tooltip>Move up</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="keyboard_arrow_down"
                :disable="index === steps.length - 1"
                @click="store.moveStep(index, index + 1)"
              >
                <q-tooltip>Move down</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                :disable="steps.length <= 1"
                @click="store.removeStep(step.id)"
              >
                <q-tooltip>Delete step</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <q-btn
        flat
        dense
        icon="add"
        label="Add step"
        color="primary"
        class="q-mb-lg"
        @click="store.addStep()"
      />

      <!-- Field assignment -->
      <div class="text-subtitle2 q-mb-sm">Assign fields to steps</div>
      <div v-if="fields.length === 0" class="text-caption text-grey-6">
        Add fields to the form to assign them to steps.
      </div>
      <q-list v-else bordered separator class="rounded-borders">
        <q-item v-for="field in fields" :key="field.id">
          <q-item-section>
            <q-item-label>{{ fieldLabel(field) }}</q-item-label>
            <q-item-label caption>{{ field.type }}</q-item-label>
          </q-item-section>
          <q-item-section side class="step-manager__assign">
            <q-select
              :model-value="fieldStepId(field)"
              :options="stepOptions"
              dense
              outlined
              emit-value
              map-options
              @update:model-value="(v: unknown) => onAssign(field.id, v)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </div>
</template>

<style scoped>
.step-manager__assign {
  min-width: 180px;
}
</style>
