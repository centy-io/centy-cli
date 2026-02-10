import { daemonGetPrByDisplayNumber } from '../../daemon/daemon-get-pr-by-display-number.js'
import { daemonUpdatePr } from '../../daemon/daemon-update-pr.js'
import { CloseEntityError } from './close-entity-error.js'

export async function closePr(
  projectPath: string,
  displayNumber: number,
  jsonOutput: boolean,
  log: (msg: string) => void
): Promise<void> {
  const pr = await daemonGetPrByDisplayNumber({
    projectPath,
    displayNumber,
  })

  const response = await daemonUpdatePr({
    projectPath,
    prId: pr.id,
    status: 'closed',
  })

  if (!response.success) {
    throw new CloseEntityError(response.error)
  }

  if (jsonOutput) {
    log(JSON.stringify({ type: 'pr', ...response.pr }, null, 2))
    return
  }

  log(`Closed PR #${response.pr.displayNumber}`)
}
