import { v4 as uuidv4 } from 'uuid'
import type { FormField, FormSchema, FormStep } from '@/types'

/**
 * Generates a unique step ID.
 */
export function generateStepId(): string {
  return `step_${uuidv4().slice(0, 8)}`
}

/**
 * Creates a new step with the given (or default) title.
 */
export function createStep(title?: string): FormStep {
  return { id: generateStepId(), title: title ?? 'New Step' }
}

/**
 * Whether the schema is configured as a multi-step (wizard) form.
 */
export function isMultiStep(schema: FormSchema): boolean {
  return Array.isArray(schema.steps) && schema.steps.length > 0
}

/**
 * Returns the fields assigned to a given step, preserving the order they
 * appear in the schema's `fields` array. Fields whose `stepId` is missing or
 * does not match any step fall back to the first step.
 */
export function getStepFields(schema: FormSchema, stepId: string): FormField[] {
  const steps = schema.steps ?? []
  const firstStepId = steps[0]?.id
  const stepIds = new Set(steps.map((s) => s.id))
  return schema.fields.filter((field) => {
    const assigned =
      field.stepId && stepIds.has(field.stepId) ? field.stepId : firstStepId
    return assigned === stepId
  })
}

/**
 * Groups fields by step in step order. Fields without a valid step assignment
 * fall back to the first step so nothing is ever dropped. Returns an empty
 * array when the form is not multi-step.
 */
export function groupFieldsBySteps(
  schema: FormSchema
): { step: FormStep; fields: FormField[] }[] {
  if (!isMultiStep(schema)) return []
  const steps = schema.steps ?? []
  return steps.map((step) => ({ step, fields: getStepFields(schema, step.id) }))
}
