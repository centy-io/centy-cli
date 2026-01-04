import { spawn } from 'node:child_process'
import { getPermissionDeniedMsg } from '../../utils/get-permission-denied-msg.js'
import { getMissingBinaryMsg } from '../../utils/get-missing-binary-msg.js'
import { findTuiBinary } from './find-tui-binary.js'
import { tuiBinaryExists } from './tui-binary-exists.js'

interface LaunchTuiResult {
  error?: string
  success: boolean
}

const TUI_ENV_VAR = 'CENTY_TUI_PATH'

function getMissingTuiMsg(path: string): string {
  return getMissingBinaryMsg(path, 'centy-tui', TUI_ENV_VAR)
}

export async function launchTui(): Promise<LaunchTuiResult> {
  const tuiPath = await findTuiBinary()

  if (!tuiBinaryExists(tuiPath)) {
    return {
      error: getMissingTuiMsg(tuiPath),
      success: false,
    }
  }

  return new Promise<LaunchTuiResult>((resolve, reject) => {
    const child = spawn(tuiPath, [], {
      detached: true,
      stdio: 'ignore',
    })

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        resolve({
          error: getMissingTuiMsg(tuiPath),
          success: false,
        })
      } else if (error.code === 'EACCES') {
        resolve({
          error: getPermissionDeniedMsg(tuiPath),
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
