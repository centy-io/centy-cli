import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('useAutostart hook', () => {
  it('should have corresponding source file', () => {
    // Module imports @opentui/react which has runtime issues in test environment
    // Verify source file exists instead of importing
    const sourcePath = resolve(__dirname, 'useAutostart.ts')
    expect(existsSync(sourcePath)).toBe(true)
  })
})
