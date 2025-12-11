/* eslint-disable ddd/require-spec-file */
import { spawn } from 'node:child_process'

import { Command, Flags } from '@oclif/core'

import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { daemonBinaryExists } from '../lib/start/daemon-binary-exists.js'
import { findDaemonBinary } from '../lib/start/find-daemon-binary.js'
import { waitForDaemon } from '../lib/start/wait-for-daemon.js'

const getMissingDaemonMsg = (p: string) =>
  `Daemon not found at: ${p}\n\nFix:\n  1. centy install daemon\n  2. centy start\n  3. centy info\n\nOr set CENTY_DAEMON_PATH.`

const getPermissionDeniedMsg = (p: string) =>
  `Permission denied: ${p}\n\nRun: chmod +x "${p}"`

export default class Start extends Command {
  static override description = 'Start the centy daemon'

  static override examples = [
    '<%= config.bin %> start',
    '<%= config.bin %> start --foreground',
    '<%= config.bin %> start -f',
  ]

  static override flags = {
    foreground: Flags.boolean({
      char: 'f',
      description: 'Run daemon in foreground (blocks terminal)',
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

    const daemonPath = findDaemonBinary()
    if (!daemonBinaryExists(daemonPath)) {
      this.error(getMissingDaemonMsg(daemonPath))
    }

    if (flags.foreground) {
      await this.startForeground(daemonPath)
    } else {
      await this.startBackground(daemonPath)
    }
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
