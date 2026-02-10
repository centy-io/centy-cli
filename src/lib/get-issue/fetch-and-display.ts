/* eslint-disable single-export/single-export */

import { daemonGetIssue } from '../../daemon/daemon-get-issue.js'
import { daemonGetIssueByDisplayNumber } from '../../daemon/daemon-get-issue-by-display-number.js'
import { checkCrossProjectIssue } from './cross-project-hint.js'
import { formatIssuePlain } from './format-issue-output.js'

interface CommandContext {
  log: (msg: string) => void
  error: (msg: string) => never
  exit: (code: number) => void
}

export function parseDisplayNumber(id: string): {
  isDisplayNumber: boolean
  displayNumber: number
} {
  const isAllDigits = /^\d+$/.test(id)
  const displayNumber = isAllDigits ? Number.parseInt(id, 10) : NaN
  const isDisplayNumber =
    isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0
  return { isDisplayNumber, displayNumber }
}

export async function fetchAndDisplayIssue(
  cwd: string,
  id: string,
  jsonMode: boolean,
  ctx: CommandContext
): Promise<void> {
  const { isDisplayNumber, displayNumber } = parseDisplayNumber(id)

  try {
    const issue = isDisplayNumber
      ? await daemonGetIssueByDisplayNumber({
          projectPath: cwd,
          displayNumber,
        })
      : await daemonGetIssue({ projectPath: cwd, issueId: id })
    if (jsonMode) {
      ctx.log(JSON.stringify(issue, null, 2))
      return
    }
    formatIssuePlain(issue, ctx.log)
  } catch (error) {
    const cross = await checkCrossProjectIssue(
      error,
      id,
      isDisplayNumber,
      jsonMode
    )
    if (cross.jsonOutput !== null) {
      ctx.log(JSON.stringify(cross.jsonOutput, null, 2))
      ctx.exit(1)
    }
    if (cross.hint !== null) {
      ctx.error(cross.hint)
    }
    throw error instanceof Error ? error : new Error(String(error))
  }
}
