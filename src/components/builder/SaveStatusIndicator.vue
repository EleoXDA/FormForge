<script setup lang="ts">
import { computed } from 'vue'
import type { AutoSaveStatus } from '@/composables'

interface Props {
  status: AutoSaveStatus
  lastSavedAt?: Date | null
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  lastSavedAt: null,
  error: null
})

const statusConfig = computed(() => {
  switch (props.status) {
    case 'pending':
      return {
        icon: 'schedule',
        color: 'grey-6',
        text: 'Unsaved changes...',
        spin: false
      }
    case 'saving':
      return {
        icon: 'sync',
        color: 'primary',
        text: 'Saving...',
        spin: true
      }
    case 'saved':
      return {
        icon: 'cloud_done',
        color: 'positive',
        text: 'Saved',
        spin: false
      }
    case 'error':
      return {
        icon: 'cloud_off',
        color: 'negative',
        text: 'Save failed',
        spin: false
      }
    default:
      return {
        icon: 'cloud_queue',
        color: 'grey-5',
        text: '',
        spin: false
      }
  }
})

const formattedTime = computed(() => {
  if (!props.lastSavedAt) return null
  return props.lastSavedAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <div class="save-status-indicator">
    <q-icon
      :name="statusConfig.icon"
      :color="statusConfig.color"
      size="18px"
      :class="{ 'spin-animation': statusConfig.spin }"
    />
    <span 
      v-if="statusConfig.text" 
      class="status-text"
      :class="`text-${statusConfig.color}`"
    >
      {{ statusConfig.text }}
    </span>
    <span v-else-if="formattedTime" class="status-text text-grey-5">
      Last saved {{ formattedTime }}
    </span>
    
    <!-- Error tooltip -->
    <q-tooltip v-if="props.status === 'error' && props.error">
      {{ props.error }}
    </q-tooltip>
  </div>
</template>

<style scoped>
.save-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-text {
  font-weight: 500;
}

.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>