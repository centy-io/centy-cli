const DEFAULT_INSTALL_SCRIPT_URL =
  'https://github.com/centy-io/installer/releases/latest/download/install.sh'

export function getInstallScriptUrl(): string {
  const { CENTY_INSTALL_SCRIPT_URL } = process.env
  return CENTY_INSTALL_SCRIPT_URL !== undefined ? CENTY_INSTALL_SCRIPT_URL : DEFAULT_INSTALL_SCRIPT_URL
}
