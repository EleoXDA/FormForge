import type { Component } from 'vue'
import type { FieldType } from '@/types'

import TextFieldRenderer from './TextFieldRenderer.vue'
import EmailFieldRenderer from './EmailFieldRenderer.vue'
import NumberFieldRenderer from './NumberFieldRenderer.vue'
import TextareaFieldRenderer from './TextareaFieldRenderer.vue'
import SelectFieldRenderer from './SelectFieldRenderer.vue'
import MultiselectFieldRenderer from './MultiselectFieldRenderer.vue'
import CheckboxFieldRenderer from './CheckboxFieldRenderer.vue'
import RadioFieldRenderer from './RadioFieldRenderer.vue'
import DateFieldRenderer from './DateFieldRenderer.vue'
import PhoneFieldRenderer from './PhoneFieldRenderer.vue'

/**
 * Maps field type strings to their renderer components.
 * Used by SchemaRenderer for dynamic component resolution.
 */
export const fieldComponentMap: Record<FieldType, Component> = {
  text: TextFieldRenderer,
  email: EmailFieldRenderer,
  number: NumberFieldRenderer,
  textarea: TextareaFieldRenderer,
  select: SelectFieldRenderer,
  multiselect: MultiselectFieldRenderer,
  checkbox: CheckboxFieldRenderer,
  radio: RadioFieldRenderer,
  date: DateFieldRenderer,
  phone: PhoneFieldRenderer
}

export {
  TextFieldRenderer,
  EmailFieldRenderer,
  NumberFieldRenderer,
  TextareaFieldRenderer,
  SelectFieldRenderer,
  MultiselectFieldRenderer,
  CheckboxFieldRenderer,
  RadioFieldRenderer,
  DateFieldRenderer,
  PhoneFieldRenderer
}