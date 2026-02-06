/* eslint-disable max-lines , single-export/single-export */

import { join } from 'node:path'
import { daemonExecuteReconciliation } from '../../daemon/daemon-execute-reconciliation.js'
import { daemonGetReconciliationPlan } from '../../daemon/daemon-get-reconciliation-plan.js'
import type {
  Config,
  ReconciliationDecisions as DaemonDecisions,
  FileInfo,
} from '../../daemon/types.js'
import type { InitOptions } from '../../types/init-options.js'
import type { InitResult } from '../../types/init-result.js'
import { closePromptInterface } from '../../utils/close-prompt-interface.js'
import { createPromptInterface } from '../../utils/create-prompt-interface.js'
import { outputSummary } from './output-summary.js'
import { promptForReset } from './prompt-for-reset.js'
import { promptForRestore } from './prompt-for-restore.js'

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

interface FileToRestore {
  path: string
  wasInManifest: boolean
}

interface FileToReset {
  path: string
  currentHash: string
  originalHash: string
}

function fileInfoToRestoreFormat(info: FileInfo): FileToRestore {
  return {
    path: info.path,
    wasInManifest: true,
  }
}

function fileInfoToResetFormat(info: FileInfo): FileToReset {
  return {
    path: info.path,
    currentHash: info.hash,
    originalHash: '',
  }
}

interface Plan {
  toRestore: FileToRestore[]
  toReset: FileToReset[]
}

interface Decisions {
  restore: string[]
  reset: string[]
  skip: string[]
}

async function gatherDecisions(
  plan: Plan,
  opts: InitOptions,
  output: NodeJS.WritableStream
): Promise<Decisions> {
  const decisions: Decisions = {
    restore: [],
    reset: [],
    skip: [],
  }

  if (plan.toRestore.length > 0) {
    if (opts.force === true) {
      decisions.restore = plan.toRestore.map(f => f.path)
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const restoreResult = await promptForRestore(rl, output, plan.toRestore)
      decisions.restore = restoreResult.restore
      decisions.skip.push(...restoreResult.skip)
      closePromptInterface(rl)
    }
  }

  if (plan.toReset.length > 0) {
    if (opts.force === true) {
      decisions.skip.push(...plan.toReset.map(f => f.path))
    } else {
      const rl = createPromptInterface(opts.input, opts.output)
      const resetResult = await promptForReset(rl, output, plan.toReset)
      decisions.reset = resetResult.reset
      decisions.skip.push(...resetResult.skip)
      closePromptInterface(rl)
    }
  }

  return decisions
}

/**
 * Build a Config object from InitOptions if any config flags were provided.
 * Returns undefined if no config options were set.
 * Proto default values (0, "", []) signal "use default from CentyConfig::default()"
 */
export function buildConfigFromOptions(opts: InitOptions): Config | undefined {
  const hasConfigOptions =
    opts.priorityLevels !== undefined ||
    opts.defaultState !== undefined ||
    opts.allowedStates !== undefined ||
    opts.version !== undefined ||
    opts.llmAutoClose !== undefined ||
    opts.llmUpdateStatus !== undefined ||
    opts.llmAllowDirectEdits !== undefined

  if (!hasConfigOptions) {
    return undefined
  }

  // Build LLM config if any LLM options were provided
  const hasLlmOptions =
    opts.llmAutoClose !== undefined ||
    opts.llmUpdateStatus !== undefined ||
    opts.llmAllowDirectEdits !== undefined

  const llmConfig = hasLlmOptions
    ? {
        autoCloseOnComplete:
          opts.llmAutoClose !== undefined ? opts.llmAutoClose : false,
        updateStatusOnStart:
          opts.llmUpdateStatus !== undefined ? opts.llmUpdateStatus : false,
        allowDirectEdits:
          opts.llmAllowDirectEdits !== undefined
            ? opts.llmAllowDirectEdits
            : false,
      }
    : {
        autoCloseOnComplete: false,
        updateStatusOnStart: false,
        allowDirectEdits: false,
      }

  return {
    priorityLevels: opts.priorityLevels !== undefined ? opts.priorityLevels : 0, // 0 = use default
    defaultState: opts.defaultState !== undefined ? opts.defaultState : '', // '' = use default
    allowedStates: opts.allowedStates !== undefined ? opts.allowedStates : [], // [] = use default
    version: opts.version !== undefined ? opts.version : '',
    llm: llmConfig,
    // These are not configurable via CLI flags, use defaults
    customFields: [],
    defaults: {},
    stateColors: {},
    priorityColors: {},
    customLinkTypes: [],
    defaultEditor: '',
    hooks: [],
  }
}
