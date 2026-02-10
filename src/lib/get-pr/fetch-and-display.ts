/* eslint-disable single-export/single-export */

import { daemonGetPr } from '../../daemon/daemon-get-pr.js'
import { daemonGetPrByDisplayNumber } from '../../daemon/daemon-get-pr-by-display-number.js'
import { checkCrossProjectPr } from './cross-project-hint.js'
import { formatPrPlain } from './format-pr-output.js'

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

export async function fetchAndDisplayPr(
  cwd: string,
  id: string,
  jsonMode: boolean,
  ctx: CommandContext
): Promise<void> {
  const { isDisplayNumber, displayNumber } = parseDisplayNumber(id)

  try {
    const pr = isDisplayNumber
      ? await daemonGetPrByDisplayNumber({ projectPath: cwd, displayNumber })
      : await daemonGetPr({ projectPath: cwd, prId: id })
    if (jsonMode) {
      ctx.log(JSON.stringify(pr, null, 2))
      return
    }
    formatPrPlain(pr, ctx.log)
  } catch (error) {
    const cross = await checkCrossProjectPr(
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
