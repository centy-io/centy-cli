import { spawn } from 'node:child_process'
import { findTuiManagerBinary } from './find-tui-manager-binary.js'
import { tuiManagerBinaryExists } from './tui-manager-binary-exists.js'

interface LaunchTuiManagerResult {
  success: boolean
  error?: string
}

const TUI_MANAGER_ENV_VAR = 'CENTY_TUI_MANAGER_PATH'

function getMissingTuiManagerMsg(path: string): string {
  return `TUI Manager not found at: ${path}

The tui-manager binary could not be located.
Set ${TUI_MANAGER_ENV_VAR} to specify the binary path.`
}

function getPermissionDeniedMsg(path: string): string {
  return `Permission denied: ${path}

Run: chmod +x "${path}"`
}

export async function launchTuiManager(): Promise<LaunchTuiManagerResult> {
  const managerPath = findTuiManagerBinary()

  if (!tuiManagerBinaryExists(managerPath)) {
    return { success: false, error: getMissingTuiManagerMsg(managerPath) }
  }

  return new Promise(resolve => {
    let child
    try {
      child = spawn(managerPath, [], { stdio: 'inherit' })
    } catch (error) {
      // spawn can throw synchronously on some platforms
      const message = error instanceof Error ? error.message : String(error)
      resolve({
        success: false,
        error: `Failed to launch TUI Manager: ${message}`,
      })
      return
    }

    child.on('error', (error: NodeJS.ErrnoException) => {
      const errno = error.code
      if (errno === 'ENOENT') {
        resolve({ success: false, error: getMissingTuiManagerMsg(managerPath) })
      } else if (errno === 'EACCES') {
        resolve({ success: false, error: getPermissionDeniedMsg(managerPath) })
      } else {
        resolve({
          success: false,
          error: `Failed to launch TUI Manager: ${error.message}`,
        })
      }
    })

    child.on('exit', code => {
      resolve({ success: code === 0 })
    })
  })
}
