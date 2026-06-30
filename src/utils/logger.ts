/**
 * Lightweight structured logger for the frontend.
 *
 * Goals (Phase 11 - Observability):
 * - Consistent, structured log entries with a level, message, timestamp and
 *   optional context.
 * - Key product events (e.g. `form_published`, `form_submitted`) are recorded
 *   via `logger.event` so they are easy to find and forward later.
 * - Quiet in production (only warnings/errors) and verbose in development.
 *
 * This is intentionally console-based. The single `write` choke point means a
 * remote sink (e.g. Sentry, Logflare) can be added later without touching call
 * sites.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
}

/** In production only surface warnings and errors; in dev show everything. */
const minLevel: LogLevel = import.meta.env.PROD ? 'warn' : 'debug'

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[minLevel]
}

/** Normalise arbitrary context (Error, object, primitive) into a plain record. */
function normalizeContext(context: unknown): Record<string, unknown> | undefined {
  if (context === undefined || context === null) return undefined
  if (context instanceof Error) {
    return { error: context.message, name: context.name }
  }
  if (typeof context === 'object') {
    return context as Record<string, unknown>
  }
  return { detail: context }
}

function write(level: LogLevel, message: string, context?: unknown): LogEntry {
  const normalized = normalizeContext(context)
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(normalized ? { context: normalized } : {})
  }

  if (shouldLog(level)) {
    const sink =
      level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    sink(`[formforge] ${message}`, normalized ?? '')
  }

  return entry
}

export const logger = {
  debug: (message: string, context?: unknown) => write('debug', message, context),
  info: (message: string, context?: unknown) => write('info', message, context),
  warn: (message: string, context?: unknown) => write('warn', message, context),
  error: (message: string, context?: unknown) => write('error', message, context),
  /**
   * Record a key product event. Prefixes the message with `event:` so events
   * can be filtered out of the log stream easily.
   */
  event: (name: string, context?: Record<string, unknown>) =>
    write('info', `event:${name}`, context)
}
