import { join } from 'node:path'
import { daemonExecuteReconciliation } from '../../daemon/daemon-execute-reconciliation.js'
import { daemonGetReconciliationPlan } from '../../daemon/daemon-get-reconciliation-plan.js'
import type { ReconciliationDecisions as DaemonDecisions } from '../../daemon/types.js'
import type { InitOptions } from '../../types/init-options.js'
import type { InitResult } from '../../types/init-result.js'
import { gatherDecisions } from './gather-decisions.js'
import { outputSummary } from './output-summary.js'
import {
  fileInfoToResetFormat,
  fileInfoToRestoreFormat,
} from './type-converters.js'

export { buildConfigFromOptions } from './config-builder.js'

const CENTY_FOLDER = '.centy'

/**
 * Initialize a .centy folder
 * Requires daemon to be running
 */
export async function init(options?: InitOptions): Promise<InitResult> {
  // eslint-disable-next-line no-restricted-syntax
  const opts = options ?? {}
  // eslint-disable-next-line no-restricted-syntax
  const cwd = opts.cwd ?? process.cwd()
  const centyPath = join(cwd, CENTY_FOLDER)
  // eslint-disable-next-line no-restricted-syntax
  const output = opts.output ?? process.stdout

  const result: InitResult = {
    success: false,
    centyPath,
    created: [],
    restored: [],
    reset: [],
    skipped: [],
    userFiles: [],
  }

  try {
    // Get reconciliation plan from daemon
    const plan = await daemonGetReconciliationPlan({ projectPath: cwd })

    output.write('Connected to centy daemon\n')

    // Convert daemon FileInfo to local format for prompts
    const filesToRestore = plan.toRestore.map(fileInfoToRestoreFormat)
    const filesToReset = plan.toReset.map(fileInfoToResetFormat)

    // Gather user decisions locally (prompts stay in CLI)
    const decisions = await gatherDecisions(
      { toRestore: filesToRestore, toReset: filesToReset },
      opts,
      output
    )

    // Convert decisions to daemon format
    const daemonDecisions: DaemonDecisions = {
      restore: decisions.restore,
      reset: decisions.reset,
    }

    // Execute reconciliation via daemon
    output.write('Initializing .centy folder...\n')
    const response = await daemonExecuteReconciliation({
      projectPath: cwd,
      decisions: daemonDecisions,
    })

    if (!response.success) {
      output.write(`Error: ${response.error}\n`)
      return result
    }

    result.success = true
    result.created = response.created
    result.restored = response.restored
    result.reset = response.reset
    result.skipped = [...response.skipped, ...decisions.skip]
    result.userFiles = plan.userFiles.map(f => f.path)

    outputSummary(output, result)
    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)

    // If daemon is unavailable, show error
    if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
      output.write(
        'Error: Centy daemon is not running. Please start the daemon first.\n'
      )
      return result
    }

    // Other errors should be reported
    output.write(`Error: ${msg}\n`)
    return result
  }
}
