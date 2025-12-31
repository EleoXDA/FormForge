import { ref, onUnmounted, type Ref } from 'vue'

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  /** Delay in milliseconds before triggering save (default: 2000) */
  debounceMs?: number
  /** Callback to perform the actual save operation */
  onSave: () => Promise<void>
  /** Whether auto-save is enabled (default: true) */
  enabled?: Ref<boolean> | boolean
}

/**
 * Composable for automatic saving with debouncing and status tracking.
 * 
 * Usage:
 * ```ts
 * const { status, trigger, save } = useAutoSave({
 *   debounceMs: 2000,
 *   onSave: async () => { await saveToDatabase() }
 * })
 * 
 * // Watch for changes and trigger auto-save
 * watch(data, () => trigger())
 * ```
 */
export function useAutoSave(options: UseAutoSaveOptions) {
  const { debounceMs = 2000, onSave, enabled = true } = options

  const status = ref<AutoSaveStatus>('idle')
  const lastSavedAt = ref<Date | null>(null)
  const error = ref<string | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Check if auto-save is currently enabled
   */
  function isEnabled(): boolean {
    if (typeof enabled === 'boolean') return enabled
    return enabled.value
  }

  /**
   * Trigger a debounced save. Multiple calls within the debounce window
   * will reset the timer.
   */
  function trigger() {
    if (!isEnabled()) return

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    status.value = 'pending'
    error.value = null

    // Set new timer
    debounceTimer = setTimeout(() => {
      save()
    }, debounceMs)
  }

  /**
   * Immediately save without waiting for debounce.
   */
  async function save() {
    if (!isEnabled()) return

    // Clear any pending debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    status.value = 'saving'
    error.value = null

    try {
      await onSave()
      status.value = 'saved'
      lastSavedAt.value = new Date()

      // Reset to idle after a short delay
      setTimeout(() => {
        if (status.value === 'saved') {
          status.value = 'idle'
        }
      }, 2000)
    } catch (err) {
      status.value = 'error'
      error.value = err instanceof Error ? err.message : 'Save failed'
      console.error('Auto-save error:', err)
    }
  }

  /**
   * Cancel any pending save operation.
   */
  function cancel() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (status.value === 'pending') {
      status.value = 'idle'
    }
  }

  // Clean up on unmount
  onUnmounted(() => {
    cancel()
  })

  return {
    /** Current save status */
    status,
    /** Timestamp of last successful save */
    lastSavedAt,
    /** Error message if save failed */
    error,
    /** Trigger a debounced save */
    trigger,
    /** Save immediately */
    save,
    /** Cancel pending save */
    cancel
  }
}