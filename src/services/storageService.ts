import { v4 as uuidv4 } from 'uuid'
import { supabase, isSupabaseConfigured, SUPABASE_URL } from './supabase'
import type { ServiceResult } from './formsService'
import type { FileReference } from '@/types'

/**
 * Storage bucket that holds files uploaded through public forms.
 * Created by the storage migration (see supabase/migrations).
 */
export const FORM_UPLOADS_BUCKET = 'form-uploads'

/**
 * Whether file uploads are available (requires a configured backend).
 */
export function isUploadEnabled(): boolean {
  return isSupabaseConfigured()
}

/**
 * Format a byte count as a short human-readable string (e.g. "1.5 MB").
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  const rounded = Math.round(value * 10) / 10
  return `${rounded} ${units[exponent]}`
}

/**
 * Whether a file satisfies a comma-separated `accept` list of extensions
 * (".pdf"), wildcard mime types ("image/*"), or exact mime types.
 */
function matchesAccept(file: { name: string; type: string }, accept: string): boolean {
  const tokens = accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true

  const name = file.name.toLowerCase()
  const mime = file.type.toLowerCase()
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return mime.startsWith(token.slice(0, -1))
    return mime === token
  })
}

/**
 * Validate a file against a field's constraints.
 * Returns an error message, or null when the file is acceptable.
 */
export function validateFile(
  file: { name: string; size: number; type: string },
  opts: { accept?: string; maxSizeMb?: number }
): string | null {
  if (opts.maxSizeMb && file.size > opts.maxSizeMb * 1024 * 1024) {
    return `File exceeds the ${opts.maxSizeMb} MB limit`
  }
  if (opts.accept && !matchesAccept(file, opts.accept)) {
    return 'File type is not allowed'
  }
  return null
}

/**
 * Strip characters that are unsafe for a storage object path.
 */
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100)
}

/**
 * PUT the file to a Supabase signed upload URL via XHR so upload progress
 * can be reported (the JS SDK upload helpers do not expose progress events).
 */
function putToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress?: (fraction: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const base = SUPABASE_URL.replace(/\/$/, '')
    const url = signedUrl.startsWith('http')
      ? signedUrl
      : `${base}/storage/v1${signedUrl.startsWith('/') ? '' : '/'}${signedUrl}`

    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    if (file.type) xhr.setRequestHeader('Content-Type', file.type)
    xhr.setRequestHeader('x-upsert', 'true')

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(event.loaded / event.total)
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1)
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(file)
  })
}

/**
 * Upload a file to Supabase Storage using a short-lived, path-scoped signed
 * upload URL, reporting progress (0..1). Returns a reference token to store
 * in the submission answers — the raw file is never placed in the payload.
 */
export async function uploadFormFile(
  formId: string,
  file: File,
  onProgress?: (fraction: number) => void
): Promise<ServiceResult<FileReference>> {
  if (!isUploadEnabled()) {
    return { success: false, error: 'File uploads require backend configuration.' }
  }

  const path = `${formId}/${uuidv4()}-${sanitizeName(file.name)}`

  try {
    const { data, error } = await supabase.storage
      .from(FORM_UPLOADS_BUCKET)
      .createSignedUploadUrl(path)

    if (error || !data) {
      return { success: false, error: error?.message || 'Could not start the upload.' }
    }

    await putToSignedUrl(data.signedUrl, file, onProgress)

    return {
      success: true,
      data: {
        bucket: FORM_UPLOADS_BUCKET,
        path: data.path ?? path,
        name: file.name,
        size: file.size,
        type: file.type
      }
    }
  } catch (err) {
    console.error('File upload failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'File upload failed.'
    }
  }
}

/**
 * Create a short-lived signed URL to download a stored file (owner-side, e.g.
 * when viewing submissions). The bucket is private, so direct URLs do not work.
 */
export async function createSignedDownloadUrl(
  reference: FileReference,
  expiresInSeconds = 3600
): Promise<ServiceResult<string>> {
  if (!isUploadEnabled()) {
    return { success: false, error: 'Backend not configured.' }
  }
  try {
    const { data, error } = await supabase.storage
      .from(reference.bucket)
      .createSignedUrl(reference.path, expiresInSeconds)
    if (error || !data) {
      return { success: false, error: error?.message || 'Could not create a download link.' }
    }
    return { success: true, data: data.signedUrl }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Could not create a download link.'
    }
  }
}
