import type { InjectionKey } from 'vue'

/**
 * Context provided by SchemaRenderer so that file fields know which form they
 * belong to and whether uploading is currently possible (backend configured).
 */
export interface FormUploadContext {
  formId?: string
  enabled: boolean
}

export const formUploadContextKey: InjectionKey<FormUploadContext> =
  Symbol('formUploadContext')
