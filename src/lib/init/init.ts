import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { InitOptions } from '../../types/init-options.js'
import type { InitResult } from '../../types/init-result.js'
import type { ReconciliationDecisions } from '../../types/reconciliation-decisions.js'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createEmptyManifest } from '../../utils/create-empty-manifest.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
import { readManifest } from '../../utils/read-manifest.js'
import { writeManifest } from '../../utils/write-manifest.js'
import { VERSION } from '../../version.js'
import { buildReconciliationPlan } from './build-reconciliation-plan.js'
import { checkFolderExists } from './check-folder-exists.js'
import { executeReconciliation } from './execute-reconciliation.js'
import { outputSummary } from './output-summary.js'
import { promptForReset } from './prompt-for-reset.js'
import { promptForRestore } from './prompt-for-restore.js'

const CENTY_FOLDER = '.centy'

/**
 * Initialize a .centy folder with CRDT-like reconciliation
 */
export async function init(options?: InitOptions): Promise<InitResult> {
  const opts = options !== undefined ? options : {}
  const cwd = opts.cwd !== undefined ? opts.cwd : process.cwd()
  const centyPath = join(cwd, CENTY_FOLDER)
  const output = opts.output !== undefined ? opts.output : process.stdout

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
    await ensureCentyFolder(centyPath, output)
    const manifest = await readManifest(centyPath)
    const plan = await buildReconciliationPlan(centyPath, manifest)
    const decisions = await gatherDecisions(plan, opts, output)
    const baseManifest =
      manifest !== null ? manifest : createEmptyManifest(VERSION)
    const updatedManifest = await executeReconciliation(
      centyPath,
      plan,
      decisions,
      baseManifest
    )

    await writeManifest(centyPath, updatedManifest)

    result.success = true
    result.created = plan.toCreate
    result.restored = decisions.restore
    result.reset = decisions.reset
    result.skipped = decisions.skip
    result.userFiles = plan.userFiles

    outputSummary(output, result)
    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    output.write(`Error: ${msg}\n`)
    return result
  }
}

async function ensureCentyFolder(
  centyPath: string,
  output: NodeJS.WritableStream
): Promise<void> {
  const folderExists = await checkFolderExists(centyPath)
  if (!folderExists) {
    output.write('Creating .centy folder...\n')
    await mkdir(centyPath, { recursive: true })
  } else {
    output.write('Found existing .centy folder. Checking for changes...\n')
  }
}

interface Plan {
  toRestore: Array<{ path: string; wasInManifest: boolean }>
  toReset: Array<{ path: string; currentHash: string; originalHash: string }>
}

async function gatherDecisions(
  plan: Plan,
  opts: InitOptions,
  output: NodeJS.WritableStream
): Promise<ReconciliationDecisions> {
  const decisions: ReconciliationDecisions = {
    restore: [],
    reset: [],
    skip: [],
  }

  if (plan.toRestore.length > 0) {
    if (opts.force) {
      decisions.restore = plan.toRestore.map(f => f.path)
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const result = await promptForRestore(rl, output, plan.toRestore)
      decisions.restore = result.restore
      decisions.skip.push(...result.skip)
      closePromptInterface(rl)
    }
  }

  if (plan.toReset.length > 0) {
    if (opts.force) {
      decisions.skip.push(...plan.toReset.map(f => f.path))
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const result = await promptForReset(rl, output, plan.toReset)
      decisions.reset = result.reset
      decisions.skip.push(...result.skip)
      closePromptInterface(rl)
    }
  }

  return decisions
}
