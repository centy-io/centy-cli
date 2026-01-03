import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('getInstallScriptUrl', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return default URL when env var is not set', async () => {
    // eslint-disable-next-line no-restricted-syntax
    delete process.env['CENTY_INSTALL_SCRIPT_URL']
    const { getInstallScriptUrl } = await import('./install-script-url.js')

    expect(getInstallScriptUrl()).toContain('centy-installer')
    expect(getInstallScriptUrl()).toContain('install.sh')
  })

  it('should return custom URL when env var is set', async () => {
    // eslint-disable-next-line no-restricted-syntax
    process.env['CENTY_INSTALL_SCRIPT_URL'] = 'https://custom.url/install.sh'
    const { getInstallScriptUrl } = await import('./install-script-url.js')

    expect(getInstallScriptUrl()).toBe('https://custom.url/install.sh')
  })
})
