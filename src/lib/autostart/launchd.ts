import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execSync } from 'node:child_process'
import plist from 'plist'
import { SERVICE_COMMAND_TIMEOUT_MS } from '../../utils/process-timeout-config.js'

const LAUNCHD_LABEL = 'io.centy.daemon'
const PLIST_FILENAME = `${LAUNCHD_LABEL}.plist`
const LAUNCHCTL_UNLOAD_OPTS = {
  stdio: 'ignore' as const,
  timeout: SERVICE_COMMAND_TIMEOUT_MS,
}

function getPlistPath(): string {
  return join(homedir(), 'Library', 'LaunchAgents', PLIST_FILENAME)
}

function generatePlist(daemonPath: string): string {
  return plist.build({
    Label: LAUNCHD_LABEL,
    ProgramArguments: [daemonPath],
    RunAtLoad: true,
    KeepAlive: false,
    StandardOutPath: join(homedir(), '.centy', 'logs', 'daemon.stdout.log'),
    StandardErrorPath: join(homedir(), '.centy', 'logs', 'daemon.stderr.log'),
  })
}

function enableAutostart(daemonPath: string): void {
  const plistPath = getPlistPath()
  const launchAgentsDir = join(homedir(), 'Library', 'LaunchAgents')

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(launchAgentsDir)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(launchAgentsDir, { recursive: true })
  }

  const logsDir = join(homedir(), '.centy', 'logs')
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(logsDir)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(logsDir, { recursive: true })
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (existsSync(plistPath)) {
    try {
      execSync(`launchctl unload "${plistPath}"`, LAUNCHCTL_UNLOAD_OPTS)
    } catch {
      // Ignore errors if service wasn't loaded
    }
  }

  const plistContent = generatePlist(daemonPath)
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  writeFileSync(plistPath, plistContent, 'utf-8')
  execSync(`launchctl load "${plistPath}"`, {
    timeout: SERVICE_COMMAND_TIMEOUT_MS,
  })
}

function disableAutostart(): void {
  const plistPath = getPlistPath()

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(plistPath)) {
    return
  }

  try {
    execSync(`launchctl unload "${plistPath}"`, LAUNCHCTL_UNLOAD_OPTS)
  } catch {
    // Ignore errors if service wasn't loaded
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  unlinkSync(plistPath)
}

function getAutostartStatus(): { enabled: boolean; daemonPath?: string } {
  const plistPath = getPlistPath()

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(plistPath)) {
    return { enabled: false }
  }

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = readFileSync(plistPath, 'utf-8')
    const parsed = plist.parse(content)
    let daemonPath: string | undefined
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      !Buffer.isBuffer(parsed) &&
      !(parsed instanceof Date) &&
      'ProgramArguments' in parsed
    ) {
      const programArgs = parsed['ProgramArguments']
      if (Array.isArray(programArgs) && programArgs.length > 0) {
        const firstArg = programArgs[0]
        if (typeof firstArg === 'string') {
          daemonPath = firstArg
        }
      }
    }
    return { enabled: true, daemonPath }
  } catch {
    return { enabled: true }
  }
}

export const launchdService = {
  enableAutostart,
  disableAutostart,
  getAutostartStatus,
}
