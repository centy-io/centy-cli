import { existsSync } from 'node:fs'

const TUI_BINARY_NAME = 'centy-tui'

export function tuiBinaryExists(path: string): boolean {
  // PATH lookup case - assume binary is accessible
  if (path === TUI_BINARY_NAME || path === `${TUI_BINARY_NAME}.exe`) {
    return true
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return existsSync(path)
}
