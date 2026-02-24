import { Command, Flags } from '@oclif/core'
import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { getInstallScriptUrl } from '../lib/install-script-url.js'
import { daemonBinaryExists } from '../lib/start/daemon-binary-exists.js'
import { findDaemonBinary } from '../lib/start/find-daemon-binary.js'
import { getDaemonSearchPaths } from '../lib/start/get-daemon-search-paths.js'
import { handleMissingDaemon } from '../lib/start/handle-missing-daemon.js'
import { startBackground } from '../lib/start/start-background.js'
import { startForeground } from '../lib/start/start-foreground.js'
import { getPermissionDeniedMsg } from '../utils/get-permission-denied-msg.js'

const INSTALL_CMD = `curl -fsSL ${getInstallScriptUrl()} | sh`

const getMissingDaemonMsg = (p: string) =>
  `Daemon not found at: ${p}\n\nFix:\n  1. Install using: ${INSTALL_CMD}\n  2. centy start\n  3. centy info\n\nOr set CENTY_DAEMON_PATH.`

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
      let installed = false
      try {
        installed = await handleMissingDaemon(
          daemonPath,
          flags.yes,
          INSTALL_CMD,
          this.log.bind(this)
        )
      } catch {
        this.error('Failed to install daemon')
      }
      if (!installed) {
        this.debugSearchedPaths()
        this.error(getMissingDaemonMsg(daemonPath))
      }
      daemonPath = findDaemonBinary()
      if (!daemonBinaryExists(daemonPath)) {
        this.error(
          'Installation succeeded but daemon binary not found. Please try again.'
        )
      }
    }

    const errorHandler = (error: Error) =>
      this.handleSpawnError(error, daemonPath)

    if (flags.foreground) {
      await startForeground(daemonPath, this.log.bind(this), errorHandler)
    } else {
      const started = await startBackground(
        daemonPath,
        this.log.bind(this),
        errorHandler
      )
      if (started) {
        this.log('Daemon started successfully')
      } else {
        this.error('Daemon started but not responding. Check logs.')
      }
    }
  }

  private debugSearchedPaths(): void {
    const paths = getDaemonSearchPaths()
    this.debug(`Searched paths:\n${paths.map(p => `  - ${p}`).join('\n')}`)
  }

  private handleSpawnError(error: Error, daemonPath: string): void {
    // eslint-disable-next-line no-restricted-syntax
    const errno = (error as NodeJS.ErrnoException).code
    if (errno === 'ENOENT') {
      this.debugSearchedPaths()
      this.error(getMissingDaemonMsg(daemonPath))
    } else if (errno === 'EACCES') {
      this.error(getPermissionDeniedMsg(daemonPath))
    } else {
      this.error(`Failed to start daemon: ${error.message}`)
    }
  }
}
