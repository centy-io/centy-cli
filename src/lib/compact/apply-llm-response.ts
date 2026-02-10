/* eslint-disable single-export/single-export */

import { readFile } from 'node:fs/promises'
import { extractAndMarkIssues } from './mark-issues.js'
import { parseLlmResponse } from './parse-llm-response.js'
import { saveCompact, saveMigration } from './save-results.js'

export interface ApplyResult {
  migrationFilename: string | null
  compactUpdated: boolean
  markedCount: number
  noIdsFound: boolean
}

export async function applyLlmResponseFromFile(
  projectPath: string,
  inputFile: string
): Promise<ApplyResult> {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = await readFile(inputFile, 'utf-8')
  const parsed = parseLlmResponse(content)

  let migrationFilename: string | null = null
  let compactUpdated = false

  if (parsed.migrationContent !== null) {
    const result = await saveMigration(projectPath, parsed.migrationContent)
    migrationFilename = result.filename
  }
  if (parsed.compactContent !== null) {
    await saveCompact(projectPath, parsed.compactContent)
    compactUpdated = true
  }

  const markResult = await extractAndMarkIssues(projectPath, content)

  return {
    migrationFilename,
    compactUpdated,
    markedCount: markResult.markedCount,
    noIdsFound: markResult.noIdsFound,
  }
}
