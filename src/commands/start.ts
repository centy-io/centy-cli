/* eslint-disable max-lines */

import { spawn, execSync } from 'node:child_process'
import { Command, Flags } from '@oclif/core'
import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { getInstallScriptUrl } from '../lib/install-script-url.js'
import { daemonBinaryExists } from '../lib/start/daemon-binary-exists.js'
import { findDaemonBinary } from '../lib/start/find-daemon-binary.js'
import { promptForInstall } from '../lib/start/prompt-for-install.js'
import { waitForDaemon } from '../lib/start/wait-for-daemon.js'
import { closePromptInterface } from '../utils/close-prompt-interface.js'
import { createPromptInterface } from '../utils/create-prompt-interface.js'

const getMissingDaemonMsg = (p: string) =>
  `Daemon not found at: ${p}\n\nFix:\n  1. centy install daemon\n  2. centy start\n  3. centy info\n\nOr set CENTY_DAEMON_PATH.`

const getPermissionDeniedMsg = (p: string) =>
  `Permission denied: ${p}\n\nRun: chmod +x "${p}"`

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Start extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Start the centy daemon'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> start',
    '<%= config.bin %> start --foreground',
    '<%= config.bin %> start -f',
    '<%= config.bin %> start --yes  # Auto-install daemon if missing',
    '<%= config.bin %> start -y',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    foreground: Flags.boolean({
      char: 'f',
      description: 'Run daemon in foreground (blocks terminal)',
      default: false,
    }),
    yes: Flags.boolean({
      char: 'y',
      description: 'Automatically install daemon if missing (skip prompt)',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Start)
    const status = await checkDaemonConnection()
    if (status.connected) {
      this.log('Daemon is already running')
      return
    }

    let daemonPath = findDaemonBinary()
    if (!daemonBinaryExists(daemonPath)) {
      const installed = await this.handleMissingDaemon(daemonPath, flags.yes)
      if (!installed) {
        this.error(getMissingDaemonMsg(daemonPath))
      }
      // Re-find the daemon path after installation
      daemonPath = findDaemonBinary()
      if (!daemonBinaryExists(daemonPath)) {
        this.error(
          'Installation succeeded but daemon binary not found. Please try again.'
        )
      }
    }

    if (flags.foreground) {
      await this.startForeground(daemonPath)
    } else {
      await this.startBackground(daemonPath)
    }
  }

  private async handleMissingDaemon(
    daemonPath: string,
    autoYes: boolean
  ): Promise<boolean> {
    let shouldInstall = autoYes

    if (!autoYes) {
      // Check if running in interactive mode (TTY)
      if (!process.stdin.isTTY) {
        this.log('Daemon not found and running in non-interactive mode.')
        this.log('Use --yes flag to auto-install, or run: centy install daemon')
        return false
      }

      const rl = createPromptInterface()
      try {
        shouldInstall = await promptForInstall({
          rl,
          output: process.stdout,
          daemonPath,
        })
      } finally {
        closePromptInterface(rl)
      }
    }

    if (!shouldInstall) {
      return false
    }

    this.log('\nInstalling daemon...\n')

    try {
      execSync(`curl -fsSL ${getInstallScriptUrl()} | sh`, {
        stdio: 'inherit',
        env: { ...process.env, BINARIES: 'centy-daemon' },
      })
    } catch {
      this.error('Failed to install daemon')
    }

    this.log('\nDaemon installed successfully\n')
    return true
  }

  private async startForeground(daemonPath: string): Promise<void> {
    this.log('Starting daemon in foreground mode...')
    const child = spawn(daemonPath, [], { stdio: 'inherit' })
    child.on('error', error => this.handleSpawnError(error, daemonPath))

    await new Promise<void>((resolve, reject) => {
      child.on('exit', code => {
        if (code === 0) resolve()
        else reject(new Error(`Daemon exited with code ${code}`))
      })
    })
  }

  private async startBackground(daemonPath: string): Promise<void> {
    this.log('Starting daemon in background...')
    const child = spawn(daemonPath, [], { detached: true, stdio: 'ignore' })
    // Track spawn errors to avoid conflicting error messages
    let spawnError: Error | null = null
    child.on('error', error => {
      spawnError = error
    })

    child.unref()
    const started = await waitForDaemon()
    // Check if spawn failed before reporting success/failure
    if (spawnError) {
      this.handleSpawnError(spawnError, daemonPath)
      return
    }

    if (started) {
      this.log('Daemon started successfully')
    } else {
      this.error('Daemon started but not responding. Check logs.')
    }
  }

  private handleSpawnError(error: Error, daemonPath: string): void {
    // eslint-disable-next-line no-restricted-syntax
    const errno = (error as NodeJS.ErrnoException).code
    if (errno === 'ENOENT') {
      this.error(getMissingDaemonMsg(daemonPath))
    } else if (errno === 'EACCES') {
      this.error(getPermissionDeniedMsg(daemonPath))
    } else {
      this.error(`Failed to start daemon: ${error.message}`)
    }
  }
}
