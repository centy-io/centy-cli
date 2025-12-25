import { findBinary } from '../find-binary/index.js'

const TUI_BINARY_NAME = 'centy-tui'
const TUI_ENV_VAR = 'CENTY_TUI_PATH'

export function findTuiBinary(): string {
  return findBinary({
    binaryName: TUI_BINARY_NAME,
    envVar: TUI_ENV_VAR,
    devRepoName: 'centy-tui',
  })
}
