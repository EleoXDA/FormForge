import { onMounted, onUnmounted } from 'vue'
import { useFormEditorStore } from '@/stores'

/**
 * Composable that sets up keyboard shortcuts for the form builder.
 * - Ctrl+Z: Undo
 * - Ctrl+Y / Ctrl+Shift+Z: Redo
 * - Delete / Backspace: Delete selected field
 * - Escape: Clear selection
 */
export function useBuilderKeyboard() {
  const store = useFormEditorStore()

  function handleKeyDown(event: KeyboardEvent) {
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modifierKey = isMac ? event.metaKey : event.ctrlKey

    // Undo: Ctrl+Z (or Cmd+Z on Mac)
    if (modifierKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      store.undo()
      return
    }

    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if (modifierKey && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault()
      store.redo()
      return
    }

    // Delete selected field
    if ((event.key === 'Delete' || event.key === 'Backspace') && store.selectedFieldId) {
      event.preventDefault()
      store.removeField(store.selectedFieldId)
      return
    }

    // Escape: Clear selection
    if (event.key === 'Escape') {
      event.preventDefault()
      store.clearSelection()
      return
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}