import { join } from 'node:path'
import { daemonInit } from '../../daemon/daemon-init.js'
import type { Config } from '../../daemon/types.js'
import type { InitOptions } from '../../types/init-options.js'
import type { InitResult } from '../../types/init-result.js'
import { isGitRepo } from '../../utils/is-git-repo.js'
import { outputSummary } from './output-summary.js'

const CENTY_FOLDER = '.centy'

function buildInitConfig(opts: InitOptions): Config | undefined {
  if (opts.priorityLevels === undefined && opts.version === undefined) {
    return undefined
  }
  return {
    customFields: [],
    defaults: {},
    priorityLevels: opts.priorityLevels !== undefined ? opts.priorityLevels : 0,
    version: opts.version !== undefined ? opts.version : '',
    stateColors: {},
    priorityColors: {},
    customLinkTypes: [],
    defaultEditor: '',
    userValues: {},
  }
}

/**
 * Initialize a .centy folder
 * Requires daemon to be running
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

  if (!isGitRepo(cwd)) {
    if (opts.skipGitCheck !== true) {
      output.write(
        'Error: Not inside a git repository. Run with --no-git to initialize anyway.\n'
      )
      return result
    }
    output.write(
      'Warning: Initializing outside a git repository is not recommended.\n'
    )
  }

  try {
    output.write('Initializing .centy folder...\n')

    const response = await daemonInit({
      projectPath: cwd,
      force: opts.force === true,
      title: '',
      initConfig: buildInitConfig(opts),
    })

    if (!response.success) {
      output.write(`Error: ${response.error}\n`)
      return result
    }

    result.success = true
    result.created = response.created
    result.restored = response.restored
    result.reset = response.reset
    result.skipped = response.skipped

    outputSummary(output, result)
    return result
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)

    if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
      output.write(
        'Error: Centy daemon is not running. Please start the daemon first.\n'
      )
      return result
    }

    output.write(`Error: ${msg}\n`)
    return result
  }
}
