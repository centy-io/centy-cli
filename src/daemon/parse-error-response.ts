import type { DaemonErrorMessage } from './types/daemon-error-message.js'
import type { DaemonErrorResponse } from './types/daemon-error-response.js'

interface ParsedErrorResult {
  response: DaemonErrorResponse
  formatted: string
  code: string | undefined
  tip: string | undefined
}

function isDaemonErrorResponse(value: unknown): value is DaemonErrorResponse {
  if (value === null || typeof value !== 'object') {
    return false
  }
  return (
    'messages' in value &&
    // eslint-disable-next-line no-restricted-syntax
    Array.isArray((value as Record<string, unknown>).messages)
  )
}

function formatErrorMessage(response: DaemonErrorResponse): string {
  const parts: string[] = []

  for (const msg of response.messages) {
    parts.push(msg.message)
    if (msg.tip) {
      parts.push(`Tip: ${msg.tip}`)
    }
  }

  if (response.logs) {
    parts.push(`Logs: ${response.logs}`)
  }

  return parts.join('\n')
}

/**
 * Try to parse a daemon error string as a structured JSON error response.
 * Returns null if the string is not valid JSON or doesn't match the expected structure.
 */
export function tryParseErrorResponse(raw: string): ParsedErrorResult | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isDaemonErrorResponse(parsed)) {
    return null
  }

  const firstMessage: DaemonErrorMessage | undefined = parsed.messages[0]

  return {
    response: parsed,
    formatted: formatErrorMessage(parsed),
    code: firstMessage ? firstMessage.code : undefined,
    tip: firstMessage ? firstMessage.tip : undefined,
  }
}
