import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a structured entry with an ISO timestamp', () => {
    const entry = logger.info('hello', { a: 1 })
    expect(entry.level).toBe('info')
    expect(entry.message).toBe('hello')
    expect(entry.context).toEqual({ a: 1 })
    expect(entry.timestamp).toBe(new Date(entry.timestamp).toISOString())
  })

  it('normalises an Error into context', () => {
    const entry = logger.error('boom', new Error('bad'))
    expect(entry.level).toBe('error')
    expect(entry.context).toEqual({ error: 'bad', name: 'Error' })
  })

  it('wraps a primitive context under detail', () => {
    const entry = logger.warn('careful', 42)
    expect(entry.context).toEqual({ detail: 42 })
  })

  it('omits context when none is provided', () => {
    const entry = logger.debug('noctx')
    expect(entry.context).toBeUndefined()
  })

  it('prefixes events and preserves context', () => {
    const entry = logger.event('form_published', { formId: 'abc' })
    expect(entry.level).toBe('info')
    expect(entry.message).toBe('event:form_published')
    expect(entry.context).toEqual({ formId: 'abc' })
  })

  it('routes errors to console.error', () => {
    logger.error('oops')
    expect(console.error).toHaveBeenCalledOnce()
  })

  it('routes info and debug to console.log', () => {
    logger.info('hi')
    logger.debug('lo')
    expect(console.log).toHaveBeenCalledTimes(2)
  })
})
