#!/usr/bin/env node

import { execute } from '@oclif/core'

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
