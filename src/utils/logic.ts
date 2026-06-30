import type { Condition, ConditionGroup, FormField, FormSchema } from '@/types'

/**
 * Returns true when a value is considered "empty" for logic purposes.
 */
function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/**
 * Resolve the current answer for the field a condition depends on.
 * Conditions reference fields by id; answers are keyed by field name.
 */
function resolveDependentValue(
  fieldId: string,
  schema: FormSchema,
  answers: Record<string, unknown>
): unknown {
  const dependency = schema.fields.find((f) => f.id === fieldId)
  if (!dependency) return undefined
  return answers[dependency.name]
}

/**
 * Evaluate a single condition against the current answers.
 * Deterministic and side-effect free (no `eval`).
 */
export function evaluateCondition(
  condition: Condition,
  schema: FormSchema,
  answers: Record<string, unknown>
): boolean {
  const actual = resolveDependentValue(condition.field, schema, answers)
  const expected = condition.value

  switch (condition.operator) {
    case 'isEmpty':
      return isEmptyValue(actual)
    case 'isNotEmpty':
      return !isEmptyValue(actual)
    case 'equals':
      if (Array.isArray(actual)) return actual.map(String).includes(String(expected ?? ''))
      return String(actual ?? '') === String(expected ?? '')
    case 'notEquals':
      if (Array.isArray(actual)) return !actual.map(String).includes(String(expected ?? ''))
      return String(actual ?? '') !== String(expected ?? '')
    case 'contains':
      if (Array.isArray(actual)) return actual.map(String).includes(String(expected ?? ''))
      return String(actual ?? '').includes(String(expected ?? ''))
    case 'gt': {
      const a = Number(actual)
      const b = Number(expected)
      return !Number.isNaN(a) && !Number.isNaN(b) && a > b
    }
    case 'lt': {
      const a = Number(actual)
      const b = Number(expected)
      return !Number.isNaN(a) && !Number.isNaN(b) && a < b
    }
    default:
      return false
  }
}

/**
 * Evaluate a condition group (AND/OR). An empty group evaluates to true.
 */
export function evaluateGroup(
  group: ConditionGroup,
  schema: FormSchema,
  answers: Record<string, unknown>
): boolean {
  if (!group.conditions.length) return true
  if (group.combinator === 'or') {
    return group.conditions.some((c) => evaluateCondition(c, schema, answers))
  }
  return group.conditions.every((c) => evaluateCondition(c, schema, answers))
}

function hasConditions(group?: ConditionGroup): group is ConditionGroup {
  return !!group && group.conditions.length > 0
}

/**
 * Whether a field should be visible given the current answers.
 * Fields without a `showIf` rule are always visible.
 */
export function isFieldVisible(
  field: FormField,
  schema: FormSchema,
  answers: Record<string, unknown>
): boolean {
  const showIf = field.logic?.showIf
  if (!hasConditions(showIf)) return true
  return evaluateGroup(showIf, schema, answers)
}

/**
 * Whether a field is required, combining its base `required` flag with
 * any `requiredIf` rule.
 */
export function isFieldRequired(
  field: FormField,
  schema: FormSchema,
  answers: Record<string, unknown>
): boolean {
  if (field.required) return true
  const requiredIf = field.logic?.requiredIf
  if (!hasConditions(requiredIf)) return false
  return evaluateGroup(requiredIf, schema, answers)
}

/**
 * Whether a field is disabled, combining its base `disabled` flag with
 * any `disableIf` rule.
 */
export function isFieldDisabled(
  field: FormField,
  schema: FormSchema,
  answers: Record<string, unknown>
): boolean {
  if (field.disabled) return true
  const disableIf = field.logic?.disableIf
  if (!hasConditions(disableIf)) return false
  return evaluateGroup(disableIf, schema, answers)
}

/**
 * Returns the list of fields that are currently visible.
 */
export function getVisibleFields(
  schema: FormSchema,
  answers: Record<string, unknown>
): FormField[] {
  return schema.fields.filter((field) => isFieldVisible(field, schema, answers))
}

/**
 * Returns only the answers belonging to currently-visible fields, so that
 * hidden fields' values are never submitted.
 */
export function filterVisibleAnswers(
  schema: FormSchema,
  answers: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const field of getVisibleFields(schema, answers)) {
    if (field.name in answers) {
      result[field.name] = answers[field.name]
    }
  }
  return result
}
