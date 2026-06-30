<script setup lang="ts">
import { computed } from 'vue'
import PropertySection from './PropertySection.vue'
import PropertyRow from './PropertyRow.vue'

interface Props {
  accept?: string
  maxSizeMb?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:file': [updates: { accept?: string; maxSizeMb?: number }]
}>()

const accept = computed({
  get: () => props.accept ?? '',
  set: (value: string) => emit('update:file', { accept: value || undefined })
})

const maxSizeMb = computed({
  get: () => props.maxSizeMb ?? null,
  set: (value: number | null) =>
    emit('update:file', { maxSizeMb: value && value > 0 ? Number(value) : undefined })
})
</script>

<template>
  <PropertySection title="File Options" :default-open="true">
    <PropertyRow label="Accepted file types">
      <q-input
        v-model="accept"
        dense
        outlined
        placeholder=".pdf,.png,image/*"
        hint="Comma-separated extensions or mime types"
      />
    </PropertyRow>
    <PropertyRow label="Max size (MB)">
      <q-input
        v-model.number="maxSizeMb"
        type="number"
        dense
        outlined
        :min="1"
        placeholder="10"
      />
    </PropertyRow>
  </PropertySection>
</template>
