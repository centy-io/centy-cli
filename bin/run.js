#!/usr/bin/env node

import { execute } from '@oclif/core'

// Bun optimization: re-exec with Bun if available (but not already running under Bun)
if (typeof Bun === 'undefined') {
  const { execSync, spawnSync } = await import('child_process')
  try {
    // Check if bun is installed
    execSync('bun --version', { stdio: 'ignore' })
    // Re-exec with bun and exit with its exit code
    const result = spawnSync(
      'bun',
      [import.meta.filename, ...process.argv.slice(2)],
      {
        stdio: 'inherit',
      }
    )
    process.exit(
      result.status !== null && result.status !== undefined ? result.status : 0
    )
  } catch {
    // Bun not installed, continue with Node
    // eslint-disable-next-line default/no-hardcoded-urls
    console.error('Tip: Install Bun for faster CLI performance: https://bun.sh')
  }
}

// Check if running with --version/-v flag
const args = process.argv.slice(2)
const isVersion = args.includes('--version') || args.includes('-v')

// Handle --version/-v flag: show CLI and daemon versions
if (isVersion) {
  const { createRequire } = await import('module')
  const require = createRequire(import.meta.url)
  const packageJson = require('../package.json')
  console.log(`CLI: ${packageJson.version}`)

  // Try to get daemon version
  try {
    const { daemonGetDaemonInfo } =
      await import('../dist/daemon/daemon-get-daemon-info.js')
    const daemonInfo = await daemonGetDaemonInfo({})
    console.log(`Daemon: ${daemonInfo.version}`)
  } catch {
    console.log(`Daemon: not running`)
  }
} else if (args.length === 0) {
  // Bare invocation: launch centy-tui
  const { launchTui } = await import('../dist/lib/launch-tui/launch-tui.js')
  const result = await launchTui()
  if (!result.success) {
    console.error(result.error)
    process.exit(1)
  }
} else {
  await execute({ dir: import.meta.url })
}
