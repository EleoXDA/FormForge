import { describe, it, expect } from 'vitest'
import type { Condition, ConditionGroup, FormField, FormSchema } from '@/types'
import {
  evaluateCondition,
  evaluateGroup,
  isFieldVisible,
  isFieldRequired,
  isFieldDisabled,
  getVisibleFields,
  filterVisibleAnswers
} from './logic'

function textField(id: string, name: string, extra: Partial<FormField> = {}): FormField {
  return { id, type: 'text', name, label: name, ...extra } as FormField
}

function schemaWith(fields: FormField[]): FormSchema {
  return { schemaVersion: 1, settings: {}, fields }
}

const triggerField = textField('f-trigger', 'trigger')

function condition(extra: Partial<Condition>): Condition {
  return { field: 'f-trigger', operator: 'equals', ...extra } as Condition
}

describe('evaluateCondition', () => {
  const schema = schemaWith([triggerField])

  it('equals matches string answers', () => {
    expect(evaluateCondition(condition({ operator: 'equals', value: 'yes' }), schema, { trigger: 'yes' })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'equals', value: 'yes' }), schema, { trigger: 'no' })).toBe(false)
  })

  it('notEquals inverts equals', () => {
    expect(evaluateCondition(condition({ operator: 'notEquals', value: 'yes' }), schema, { trigger: 'no' })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'notEquals', value: 'yes' }), schema, { trigger: 'yes' })).toBe(false)
  })

  it('contains works for strings and arrays', () => {
    expect(evaluateCondition(condition({ operator: 'contains', value: 'ell' }), schema, { trigger: 'hello' })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'contains', value: 'b' }), schema, { trigger: ['a', 'b'] })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'contains', value: 'z' }), schema, { trigger: ['a', 'b'] })).toBe(false)
  })

  it('gt and lt compare numerically and are NaN-safe', () => {
    expect(evaluateCondition(condition({ operator: 'gt', value: 5 }), schema, { trigger: 10 })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'gt', value: 5 }), schema, { trigger: 3 })).toBe(false)
    expect(evaluateCondition(condition({ operator: 'lt', value: 5 }), schema, { trigger: 3 })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'gt', value: 5 }), schema, { trigger: 'abc' })).toBe(false)
  })

  it('isEmpty and isNotEmpty handle blanks, arrays and missing values', () => {
    expect(evaluateCondition(condition({ operator: 'isEmpty' }), schema, { trigger: '' })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'isEmpty' }), schema, { trigger: '   ' })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'isEmpty' }), schema, {})).toBe(true)
    expect(evaluateCondition(condition({ operator: 'isEmpty' }), schema, { trigger: [] })).toBe(true)
    expect(evaluateCondition(condition({ operator: 'isNotEmpty' }), schema, { trigger: 'x' })).toBe(true)
  })

  it('returns isEmpty true when the dependent field does not exist', () => {
    expect(evaluateCondition(condition({ field: 'missing', operator: 'isEmpty' }), schema, {})).toBe(true)
    expect(evaluateCondition(condition({ field: 'missing', operator: 'equals', value: 'x' }), schema, {})).toBe(false)
  })
})

describe('evaluateGroup', () => {
  const schema = schemaWith([triggerField, textField('f-2', 'second')])

  const both: ConditionGroup = {
    combinator: 'and',
    conditions: [
      condition({ operator: 'equals', value: 'a' }),
      { field: 'f-2', operator: 'equals', value: 'b' }
    ]
  }

  it('AND requires every condition', () => {
    expect(evaluateGroup(both, schema, { trigger: 'a', second: 'b' })).toBe(true)
    expect(evaluateGroup(both, schema, { trigger: 'a', second: 'x' })).toBe(false)
  })

  it('OR requires at least one condition', () => {
    const group: ConditionGroup = { ...both, combinator: 'or' }
    expect(evaluateGroup(group, schema, { trigger: 'a', second: 'x' })).toBe(true)
    expect(evaluateGroup(group, schema, { trigger: 'x', second: 'x' })).toBe(false)
  })

  it('an empty group evaluates to true', () => {
    expect(evaluateGroup({ combinator: 'and', conditions: [] }, schema, {})).toBe(true)
  })
})

describe('field state helpers', () => {
  const dependent = textField('f-dep', 'dependent', {
    logic: {
      showIf: { combinator: 'and', conditions: [condition({ operator: 'equals', value: 'show' })] }
    }
  })
  const schema = schemaWith([triggerField, dependent])

  it('isFieldVisible defaults to visible without a showIf rule', () => {
    expect(isFieldVisible(triggerField, schema, {})).toBe(true)
  })

  it('isFieldVisible honours showIf', () => {
    expect(isFieldVisible(dependent, schema, { trigger: 'show' })).toBe(true)
    expect(isFieldVisible(dependent, schema, { trigger: 'hide' })).toBe(false)
  })

  it('isFieldRequired combines base required and requiredIf', () => {
    const base = textField('f-r', 'r', { required: true })
    expect(isFieldRequired(base, schema, {})).toBe(true)

    const conditional = textField('f-r2', 'r2', {
      logic: { requiredIf: { combinator: 'and', conditions: [condition({ operator: 'equals', value: 'go' })] } }
    })
    expect(isFieldRequired(conditional, schema, { trigger: 'go' })).toBe(true)
    expect(isFieldRequired(conditional, schema, { trigger: 'stop' })).toBe(false)
  })

  it('isFieldDisabled combines base disabled and disableIf', () => {
    const base = textField('f-d', 'd', { disabled: true })
    expect(isFieldDisabled(base, schema, {})).toBe(true)

    const conditional = textField('f-d2', 'd2', {
      logic: { disableIf: { combinator: 'and', conditions: [condition({ operator: 'equals', value: 'lock' })] } }
    })
    expect(isFieldDisabled(conditional, schema, { trigger: 'lock' })).toBe(true)
    expect(isFieldDisabled(conditional, schema, { trigger: 'open' })).toBe(false)
  })
})

describe('getVisibleFields and filterVisibleAnswers', () => {
  const dependent = textField('f-dep', 'dependent', {
    logic: {
      showIf: { combinator: 'and', conditions: [condition({ operator: 'equals', value: 'show' })] }
    }
  })
  const schema = schemaWith([triggerField, dependent])

  it('getVisibleFields excludes hidden fields', () => {
    expect(getVisibleFields(schema, { trigger: 'show' }).map((f) => f.id)).toEqual(['f-trigger', 'f-dep'])
    expect(getVisibleFields(schema, { trigger: 'hide' }).map((f) => f.id)).toEqual(['f-trigger'])
  })

  it('filterVisibleAnswers drops answers for hidden fields', () => {
    const answers = { trigger: 'hide', dependent: 'leftover' }
    expect(filterVisibleAnswers(schema, answers)).toEqual({ trigger: 'hide' })
  })
})
