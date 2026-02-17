/* eslint-disable single-export/single-export */

import { CompactParseError } from './compact-parse-error.js'

export interface ParsedLlmResponse {
  migrationContent: string | null
  compactContent: string | null
}

export function parseLlmResponse(content: string): ParsedLlmResponse {
  const migrationMatch = content.match(
    /### MIGRATION_CONTENT\s*\n```(?:markdown|yaml)?\s*\n([\s\S]*?)```/i
  )
  const compactMatch = content.match(
    /### COMPACT_CONTENT\s*\n```(?:markdown)?\s*\n([\s\S]*?)```/i
  )

  if (migrationMatch !== null || compactMatch !== null) {
    return {
      migrationContent: migrationMatch !== null ? migrationMatch[1] : null,
      compactContent: compactMatch !== null ? compactMatch[1] : null,
    }
  }

  const altMigrationMatch = content.match(
    /### MIGRATION_CONTENT\s*\n([\s\S]*?)(?=### COMPACT_CONTENT|$)/i
  )
  const altCompactMatch = content.match(/### COMPACT_CONTENT\s*\n([\s\S]*?)$/i)

  if (altMigrationMatch === null && altCompactMatch === null) {
    throw new CompactParseError()
  }

  return {
    migrationContent:
      altMigrationMatch !== null ? altMigrationMatch[1].trim() : null,
    compactContent: altCompactMatch !== null ? altCompactMatch[1].trim() : null,
  }
}
