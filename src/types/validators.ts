import { z } from 'zod'

/**
 * Zod schema for field options (select, radio, etc.)
 */
export const fieldOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1)
})

/**
 * Zod schema for validation rules.
 */
export const validationRulesSchema = z.object({
  minLength: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  patternMessage: z.string().optional()
})

/**
 * Base field schema (shared properties).
 */
const baseFieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.string(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  defaultValue: z.unknown().optional()
})

/**
 * Discriminated union of all field types.
 */
export const formFieldSchema = z.discriminatedUnion('type', [
  baseFieldSchema.extend({
    type: z.literal('text'),
    validation: validationRulesSchema.pick({ minLength: true, maxLength: true, pattern: true, patternMessage: true }).optional()
  }),
  baseFieldSchema.extend({
    type: z.literal('email'),
    validation: validationRulesSchema.pick({ pattern: true, patternMessage: true }).optional()
  }),
  baseFieldSchema.extend({
    type: z.literal('number'),
    validation: validationRulesSchema.pick({ min: true, max: true }).optional(),
    step: z.number().optional()
  }),
  baseFieldSchema.extend({
    type: z.literal('textarea'),
    rows: z.number().int().positive().optional(),
    validation: validationRulesSchema.pick({ minLength: true, maxLength: true }).optional()
  }),
  baseFieldSchema.extend({
    type: z.literal('select'),
    options: z.array(fieldOptionSchema).min(1)
  }),
  baseFieldSchema.extend({
    type: z.literal('multiselect'),
    options: z.array(fieldOptionSchema).min(1)
  }),
  baseFieldSchema.extend({
    type: z.literal('checkbox'),
    options: z.array(fieldOptionSchema).optional()
  }),
  baseFieldSchema.extend({
    type: z.literal('radio'),
    options: z.array(fieldOptionSchema).min(1)
  }),
  baseFieldSchema.extend({
    type: z.literal('date'),
    minDate: z.string().optional(),
    maxDate: z.string().optional()
  }),
  baseFieldSchema.extend({
    type: z.literal('phone'),
    validation: validationRulesSchema.pick({ pattern: true, patternMessage: true }).optional()
  })
])

/**
 * Form settings schema.
 */
export const formSettingsSchema = z.object({
  submitButtonText: z.string().optional(),
  successMessage: z.string().optional(),
  redirectUrl: z.string().url().optional(),
  allowMultipleSubmissions: z.boolean().optional()
})

/**
 * Complete form schema validator.
 */
export const formSchemaValidator = z.object({
  schemaVersion: z.number().int().positive(),
  settings: formSettingsSchema,
  fields: z.array(formFieldSchema)
})

/**
 * Validates a form schema and returns typed result.
 */
export function validateFormSchema(input: unknown) {
  return formSchemaValidator.safeParse(input)
}