import { spawn } from 'node:child_process'
import { getPermissionDeniedMsg } from '../../utils/get-permission-denied-msg.js'
import { getMissingBinaryMsg } from '../../utils/get-missing-binary-msg.js'
import { findTuiManagerBinary } from './find-tui-manager-binary.js'
import { tuiManagerBinaryExists } from './tui-manager-binary-exists.js'

interface LaunchTuiManagerResult {
  error?: string
  success: boolean
}

const TUI_MANAGER_ENV_VAR = 'CENTY_TUI_MANAGER_PATH'

function getMissingTuiManagerMsg(path: string): string {
  return getMissingBinaryMsg(path, 'tui-manager', TUI_MANAGER_ENV_VAR)
}

export async function launchTuiManager(): Promise<LaunchTuiManagerResult> {
  const tuiManagerPath = await findTuiManagerBinary()

  if (!tuiManagerBinaryExists(tuiManagerPath)) {
    return {
      error: getMissingTuiManagerMsg(tuiManagerPath),
      success: false,
    }
  }

  return new Promise<LaunchTuiManagerResult>((resolve, reject) => {
    const child = spawn(tuiManagerPath, [], {
      detached: true,
      stdio: 'ignore',
    })

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        resolve({
          error: getMissingTuiManagerMsg(tuiManagerPath),
          success: false,
        })
      } else if (error.code === 'EACCES') {
        resolve({
          error: getPermissionDeniedMsg(tuiManagerPath),
          success: false,
        })
      } else {
        reject(error)
      }
    })

    child.on('spawn', () => {
      child.unref()
      resolve({ success: true })
    })
  })
}
