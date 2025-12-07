import { createCliRenderer, type CliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import React from 'react'
import { App } from './App.js'
import { AppProvider } from './state/app-state.js'
import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { loadIssueSortConfig } from './utils/local-config.js'

export async function startTUI(): Promise<void> {
  // Check daemon connection first
  const connectionStatus = await checkDaemonConnection()

  if (!connectionStatus.connected) {
    console.log('\x1b[33mWarning: Centy daemon is not running.\x1b[0m')
    console.log('Some features will be unavailable.')
    console.log('Run "centy start" to start the daemon.\n')
  }

  // Load saved sort configuration
  const savedSortConfig = loadIssueSortConfig()

  // Create renderer
  const renderer: CliRenderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: false,
  })

  // Create React root
  const root = createRoot(renderer)

  // Exit handler
  const handleExit = () => {
    root.unmount()
    renderer.destroy()
    process.exit(0)
  }

  // Render the app
  root.render(
    React.createElement(AppProvider, {
      initialDaemonConnected: connectionStatus.connected,
      initialIssueSort: savedSortConfig,
      children: React.createElement(App, { onExit: handleExit }),
    })
  )

  // Start the renderer
  renderer.start()

  // Handle process signals
  process.on('SIGINT', handleExit)
  process.on('SIGTERM', handleExit)
}
