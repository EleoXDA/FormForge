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

/**
 * Text input field configuration.
 */
export interface TextField extends BaseField {
  type: 'text'
  validation?: Pick<ValidationRules, 'minLength' | 'maxLength' | 'pattern' | 'patternMessage'>
}

/**
 * Email input field configuration.
 */
export interface EmailField extends BaseField {
  type: 'email'
  validation?: Pick<ValidationRules, 'pattern' | 'patternMessage'>
}

/**
 * Number input field configuration.
 */
export interface NumberField extends BaseField {
  type: 'number'
  validation?: Pick<ValidationRules, 'min' | 'max'>
  step?: number
}

/**
 * Textarea field configuration.
 */
export interface TextareaField extends BaseField {
  type: 'textarea'
  rows?: number
  validation?: Pick<ValidationRules, 'minLength' | 'maxLength'>
}

/**
 * Single-select dropdown field configuration.
 */
export interface SelectField extends BaseField {
  type: 'select'
  options: FieldOption[]
}

/**
 * Multi-select dropdown field configuration.
 */
export interface MultiselectField extends BaseField {
  type: 'multiselect'
  options: FieldOption[]
}

/**
 * Checkbox field configuration (single or group).
 */
export interface CheckboxField extends BaseField {
  type: 'checkbox'
  options?: FieldOption[]
}

/**
 * Radio button group field configuration.
 */
export interface RadioField extends BaseField {
  type: 'radio'
  options: FieldOption[]
}

/**
 * Date picker field configuration.
 */
export interface DateField extends BaseField {
  type: 'date'
  minDate?: string
  maxDate?: string
}

/**
 * Phone number field configuration.
 */
export interface PhoneField extends BaseField {
  type: 'phone'
  validation?: Pick<ValidationRules, 'pattern' | 'patternMessage'>
}

/**
 * Discriminated union of all field types.
 * The `type` property acts as the discriminant.
 */
export type FormField =
  | TextField
  | EmailField
  | NumberField
  | TextareaField
  | SelectField
  | MultiselectField
  | CheckboxField
  | RadioField
  | DateField
  | PhoneField