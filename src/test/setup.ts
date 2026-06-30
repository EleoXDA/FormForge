/**
 * Vitest setup file
 * This runs before each test file
 */

import { config } from '@vue/test-utils'
import { afterEach, vi } from 'vitest'

// Mock Quasar plugins that aren't available in test environment
vi.mock('quasar', async () => {
  const actual = await vi.importActual('quasar')
  return {
    ...actual,
    useQuasar: () => ({
      notify: vi.fn(),
      dialog: vi.fn(() => ({ onOk: vi.fn() }))
    })
  }
})

// Configure Vue Test Utils defaults
config.global.stubs = {
  // Stub Quasar components to avoid import issues
  'q-input': true,
  'q-btn': true,
  'q-card': true,
  'q-icon': true,
  'q-badge': true,
  'q-tooltip': true,
  'q-separator': true,
  'q-toggle': true,
  'q-select': true,
  'q-checkbox': true,
  'q-option-group': true,
  // Runtime renderer components
  'q-form': true,
  'q-field': true,
  'q-space': true,
  'q-banner': true,
  'q-linear-progress': true,
  'q-file': true,
  'q-date': true,
  'q-popup-proxy': true
}

// No-op directives so component tests don't warn about Quasar directives.
config.global.directives = {
  'close-popup': {},
  ripple: {}
}

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})
