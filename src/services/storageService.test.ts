import { describe, it, expect } from 'vitest'
import { formatFileSize, validateFile } from './storageService'

describe('storageService helpers', () => {
  describe('formatFileSize', () => {
    it('formats zero and negative values as "0 B"', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(-100)).toBe('0 B')
    })

    it('formats bytes, kilobytes and megabytes', () => {
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
    })
  })

  describe('validateFile', () => {
    const file = { name: 'photo.png', size: 1000, type: 'image/png' }

    it('accepts a file within all constraints', () => {
      expect(validateFile(file, { accept: 'image/*', maxSizeMb: 1 })).toBeNull()
    })

    it('accepts any file when no constraints are provided', () => {
      expect(validateFile(file, {})).toBeNull()
    })

    it('rejects a file over the size limit', () => {
      const big = { name: 'big.png', size: 5 * 1024 * 1024, type: 'image/png' }
      expect(validateFile(big, { maxSizeMb: 1 })).toMatch(/limit/i)
    })

    it('rejects a type not in the accept list', () => {
      expect(validateFile(file, { accept: '.pdf' })).toMatch(/not allowed/i)
    })

    it('matches an extension token', () => {
      const doc = { name: 'resume.PDF', size: 100, type: 'application/pdf' }
      expect(validateFile(doc, { accept: '.pdf' })).toBeNull()
    })

    it('matches an exact mime type token', () => {
      expect(validateFile(file, { accept: 'image/png' })).toBeNull()
    })

    it('matches a wildcard mime token', () => {
      expect(validateFile(file, { accept: 'image/*' })).toBeNull()
    })
  })
})
