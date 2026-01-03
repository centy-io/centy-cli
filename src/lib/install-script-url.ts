/* eslint-disable default/no-hardcoded-urls */
const DEFAULT_INSTALL_SCRIPT_URL =
  'https://github.com/centy-io/centy-installer/releases/latest/download/install.sh'
/* eslint-enable default/no-hardcoded-urls */

export function getInstallScriptUrl(): string {
  // eslint-disable-next-line no-restricted-syntax
  const customUrl = process.env['CENTY_INSTALL_SCRIPT_URL']
  // eslint-disable-next-line no-restricted-syntax
  return customUrl ?? DEFAULT_INSTALL_SCRIPT_URL
}
