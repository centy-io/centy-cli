import { spawn } from 'node:child_process'
import { findTuiBinary } from './find-tui-binary.js'
import { tuiBinaryExists } from './tui-binary-exists.js'

interface LaunchTuiResult {
  success: boolean
  error?: string
}

const TUI_ENV_VAR = 'CENTY_TUI_PATH'

function getMissingTuiMsg(path: string): string {
  return `TUI not found at: ${path}

The centy-tui binary could not be located.
Set ${TUI_ENV_VAR} to specify the binary path.`
}

function getPermissionDeniedMsg(path: string): string {
  return `Permission denied: ${path}

Run: chmod +x "${path}"`
}

export async function launchTui(): Promise<LaunchTuiResult> {
  const tuiPath = findTuiBinary()

  if (!tuiBinaryExists(tuiPath)) {
    return { success: false, error: getMissingTuiMsg(tuiPath) }
  }

  return new Promise(resolve => {
    let child
    try {
      child = spawn(tuiPath, [], { stdio: 'inherit' })
    } catch (error) {
      // spawn can throw synchronously on some platforms
      const message = error instanceof Error ? error.message : String(error)
      resolve({ success: false, error: `Failed to launch TUI: ${message}` })
      return
    }

    child.on('error', (error: NodeJS.ErrnoException) => {
      const errno = error.code
      if (errno === 'ENOENT') {
        resolve({ success: false, error: getMissingTuiMsg(tuiPath) })
      } else if (errno === 'EACCES') {
        resolve({ success: false, error: getPermissionDeniedMsg(tuiPath) })
      } else if (errno === 'ENOTSUP' || errno === 'Unknown system error -88') {
        // Binary exists but cannot be executed (e.g., wrong architecture)
        resolve({
          success: false,
          error: `Cannot execute TUI binary: ${tuiPath}`,
        })
      } else {
        resolve({
          success: false,
          error: `Failed to launch TUI: ${error.message}`,
        })
      }
    })

    child.on('exit', code => {
      resolve({ success: code === 0 })
    })
  })
}
