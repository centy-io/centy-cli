import { findBinary } from '../find-binary/index.js'

const TUI_MANAGER_BINARY_NAME = 'tui-manager'
const TUI_MANAGER_ENV_VAR = 'CENTY_TUI_MANAGER_PATH'

export function findTuiManagerBinary(): string {
  return findBinary({
    binaryName: TUI_MANAGER_BINARY_NAME,
    envVar: TUI_MANAGER_ENV_VAR,
    devRepoName: 'tui-manager',
  })
}
