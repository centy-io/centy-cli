import { existsSync } from 'node:fs'

const TUI_MANAGER_BINARY_NAME = 'tui-manager'

export function tuiManagerBinaryExists(path: string): boolean {
  // PATH lookup case - assume binary is accessible
  if (
    path === TUI_MANAGER_BINARY_NAME ||
    path === `${TUI_MANAGER_BINARY_NAME}.exe`
  ) {
    return true
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return existsSync(path)
}
