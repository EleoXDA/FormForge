import { describe, it, expect } from 'vitest'
import type { FormField, FormSchema, FormStep } from '@/types'
import {
  generateStepId,
  createStep,
  isMultiStep,
  getStepFields,
  groupFieldsBySteps
} from './steps'

function field(id: string, stepId?: string): FormField {
  return { id, type: 'text', name: id, label: id, ...(stepId ? { stepId } : {}) } as FormField
}

function schema(steps: FormStep[] | undefined, fields: FormField[]): FormSchema {
  return { schemaVersion: 1, settings: {}, ...(steps ? { steps } : {}), fields }
}

describe('step utilities', () => {
  describe('generateStepId', () => {
    it('generates a string starting with "step_"', () => {
      expect(generateStepId()).toMatch(/^step_[a-z0-9]+$/)
    })
  })

  describe('createStep', () => {
    it('creates a step with an id and the given title', () => {
      const s = createStep('My Step')
      expect(s.title).toBe('My Step')
      expect(s.id).toMatch(/^step_/)
    })
  })

  describe('isMultiStep', () => {
    it('is false without steps', () => {
      expect(isMultiStep(schema(undefined, []))).toBe(false)
      expect(isMultiStep(schema([], []))).toBe(false)
    })

    it('is true with at least one step', () => {
      expect(isMultiStep(schema([{ id: 's1', title: 'One' }], []))).toBe(true)
    })
  })

  describe('getStepFields', () => {
    const steps: FormStep[] = [
      { id: 's1', title: 'One' },
      { id: 's2', title: 'Two' }
    ]

    it('returns fields assigned to the step in schema order', () => {
      const s = schema(steps, [field('a', 's1'), field('b', 's2'), field('c', 's1')])
      expect(getStepFields(s, 's1').map((f) => f.id)).toEqual(['a', 'c'])
      expect(getStepFields(s, 's2').map((f) => f.id)).toEqual(['b'])
    })

    it('assigns orphan fields (missing/invalid stepId) to the first step', () => {
      const s = schema(steps, [field('a'), field('b', 'nope'), field('c', 's2')])
      expect(getStepFields(s, 's1').map((f) => f.id)).toEqual(['a', 'b'])
      expect(getStepFields(s, 's2').map((f) => f.id)).toEqual(['c'])
    })
  })

  describe('groupFieldsBySteps', () => {
    it('returns an empty array when not multi-step', () => {
      expect(groupFieldsBySteps(schema(undefined, [field('a')]))).toEqual([])
    })

    it('groups fields under each step in order', () => {
      const steps: FormStep[] = [
        { id: 's1', title: 'One' },
        { id: 's2', title: 'Two' }
      ]
      const grouped = groupFieldsBySteps(schema(steps, [field('a', 's1'), field('b', 's2')]))
      expect(grouped.map((g) => g.step.id)).toEqual(['s1', 's2'])
      expect(grouped.find((g) => g.step.id === 's1')?.fields.map((f) => f.id)).toEqual(['a'])
      expect(grouped.find((g) => g.step.id === 's2')?.fields.map((f) => f.id)).toEqual(['b'])
    })
  })
})
