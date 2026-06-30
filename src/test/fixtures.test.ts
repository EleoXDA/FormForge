import { describe, it, expect } from 'vitest'
import { validateFormSchema } from '@/types'
import contactForm from '../../fixtures/contact-form.json'
import jobApplication from '../../fixtures/job-application.json'
import eventRegistration from '../../fixtures/event-registration.json'

/**
 * Regression fixtures: representative form schemas stored in /fixtures.
 * These guard against schema/validator drift — every sample form must remain
 * a valid, renderable schema as the codebase evolves.
 */
const fixtures = [
  { name: 'contact-form', schema: contactForm },
  { name: 'job-application', schema: jobApplication },
  { name: 'event-registration', schema: eventRegistration }
]

describe('schema fixtures', () => {
  it.each(fixtures)('$name is a valid form schema', ({ schema }) => {
    const result = validateFormSchema(schema)
    expect(result.success).toBe(true)
  })

  it('exercise a representative spread of field types', () => {
    const types = new Set<string>()
    for (const { schema } of fixtures) {
      for (const field of schema.fields) {
        types.add(field.type)
      }
    }

    for (const expected of ['text', 'email', 'select', 'radio', 'checkbox', 'date', 'file', 'multiselect']) {
      expect(types).toContain(expected)
    }
  })

  it('includes a multi-step fixture with assigned steps', () => {
    const result = validateFormSchema(eventRegistration)
    expect(result.success).toBe(true)
    expect(eventRegistration.steps).toHaveLength(2)
    expect(eventRegistration.fields.every((f) => 'stepId' in f)).toBe(true)
  })
})
