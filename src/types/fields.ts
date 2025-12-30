/**
 * All supported field types in FormForge.
 * Each type maps to a specific renderer component.
 */
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DATE: 'date',
  PHONE: 'phone'
} as const

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES]

/**
 * Option item for select, multiselect, radio, and checkbox fields.
 */
export interface FieldOption {
  value: string
  label: string
}

/**
 * Base properties shared by all field types.
 */
export interface BaseField {
  id: string
  type: FieldType
  name: string
  label: string
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  defaultValue?: unknown
}

/**
 * Validation rules that can apply to various field types.
 */
export interface ValidationRules {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  patternMessage?: string
}