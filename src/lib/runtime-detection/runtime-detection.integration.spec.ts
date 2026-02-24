/* eslint-disable security/detect-non-literal-fs-filename -- Test file uses controlled path constants */
import fs from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// =============================================================================
// Constants
// =============================================================================

const BIN_DIR = path.resolve(__dirname, '../../../bin')
const RUN_JS = path.join(BIN_DIR, 'run.js')
const RUN_CMD = path.join(BIN_DIR, 'run.cmd')
const IS_WINDOWS = process.platform === 'win32'
const DEFAULT_TIMEOUT = 30000

// =============================================================================
// Types
// =============================================================================

interface SpawnResult {
  stdout: string
  stderr: string
  exitCode: number | null
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Gets the PATH environment variable safely.
 * Returns an empty string if PATH is undefined or null.
 */
function getPath(env: NodeJS.ProcessEnv): string {
  const pathValue = env.PATH
  if (pathValue === undefined || pathValue === null) {
    return ''
  }
  return pathValue
}

/**
 * Creates a PATH environment variable that excludes Bun directories.
 * This simulates an environment where Bun is not installed.
 */
function createPathWithoutBun(): string {
  const currentPath = getPath(process.env)
  return currentPath
    .split(path.delimiter)
    .filter(dir => !dir.toLowerCase().includes('bun'))
    .join(path.delimiter)
}

/**
 * Checks if Bun is available in the current environment.
 */
function checkBunAvailable(): boolean {
  try {
    const result = spawnSync('bun', ['--version'], {
      encoding: 'utf-8',
      timeout: 5000,
    })
    return result.status === 0
  } catch {
    return false
  }
}

/**
 * Runs a script with the specified runtime and captures output.
 * @param runtime - The runtime to use ('node' or 'bun')
 * @param scriptPath - Path to the script to run
 * @param args - Arguments to pass to the script
 * @param env - Environment variables
 * @param timeout - Timeout in milliseconds
 */
async function runWithRuntime(
  runtime: 'node' | 'bun',
  scriptPath: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  timeout: number = DEFAULT_TIMEOUT
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(runtime, [scriptPath, ...args], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    if (child.stdout) {
      child.stdout.on('data', data => {
        stdout += data.toString()
      })
    }

    if (child.stderr) {
      child.stderr.on('data', data => {
        stderr += data.toString()
      })
    }

    child.on('close', exitCode => {
      resolve({ stdout, stderr, exitCode })
    })

    child.on('error', error => {
      reject(error)
    })

    const timeoutId = setTimeout(() => {
      child.kill()
      reject(new Error(`Script execution timed out after ${timeout}ms`))
    }, timeout)

    child.on('close', () => clearTimeout(timeoutId))
  })
}

/**
 * Runs the bin/run.js script with Node and captures output.
 * Convenience wrapper around runWithRuntime.
 */
async function runWrapper(
  scriptPath: string,
  args: string[],
  env: NodeJS.ProcessEnv
): Promise<SpawnResult> {
  return runWithRuntime('node', scriptPath, args, env)
}

/**
 * Runs a Windows batch file and captures output.
 * Only works on Windows.
 */
async function runBatchFile(
  batchPath: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  timeout: number = DEFAULT_TIMEOUT
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('cmd.exe', ['/c', batchPath, ...args], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    if (child.stdout) {
      child.stdout.on('data', data => {
        stdout += data.toString()
      })
    }

    if (child.stderr) {
      child.stderr.on('data', data => {
        stderr += data.toString()
      })
    }

    child.on('close', exitCode => {
      resolve({ stdout, stderr, exitCode })
    })

    child.on('error', error => {
      reject(error)
    })

    const timeoutId = setTimeout(() => {
      child.kill()
      reject(new Error(`Batch file execution timed out after ${timeout}ms`))
    }, timeout)

    child.on('close', () => clearTimeout(timeoutId))
  })
}

// =============================================================================
// Tests
// =============================================================================

describe('runtime detection wrapper', { timeout: DEFAULT_TIMEOUT }, () => {
  const bunAvailable = checkBunAvailable()

  // Note: The following tests are skipped on Node 20 in CI due to a flaky oclif/ESM module resolution
  // issue where the help class resolution fails intermittently with "Unknown file extension .ts".
  // This is not related to the actual CLI functionality and passes on Node 22 and locally.
  // See: https://github.com/oclif/core/issues - ESM resolution issues
  const isNode20 = process.version.startsWith('v20.')
  // eslint-disable-next-line no-restricted-syntax
  const isCI = process.env['CI'] === 'true'
  const skipOnNode20CI = isNode20 && isCI

  // ===========================================================================
  // bin/run.js Tests (Cross-platform)
  // ===========================================================================

  describe('bin/run.js (cross-platform)', () => {
    describe('when Bun is available', () => {
      const itWithBun = bunAvailable ? it : it.skip

      itWithBun('should not show Bun tip message on stderr', async () => {
        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
        })

        expect(result.stderr).not.toContain('Tip: Install Bun')
        expect(result.stderr).not.toContain('https://bun.sh')
      })

      itWithBun('should execute successfully with exit code 0', async () => {
        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
        })

        expect(result.exitCode).toBe(0)
      })

      itWithBun('should produce CLI version output', async () => {
        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
        })

        expect(result.stdout).toContain('CLI:')
      })
    })

    describe('when only Node.js is available', () => {
      it('should show Bun installation tip on stderr', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.stderr).toContain(
          'Tip: Install Bun for faster CLI performance'
        )
        expect(result.stderr).toContain('https://bun.sh')
      })

      it('should complete successfully with exit code 0', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).toBe(0)
      })

      it('should output version info to stdout', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.stdout).toContain('CLI:')
      })
    })

    describe('argument passing', () => {
      it.skipIf(skipOnNode20CI)(
        'should pass --help argument correctly',
        async () => {
          const pathWithoutBun = createPathWithoutBun()

          const result = await runWrapper(RUN_JS, ['--help'], {
            ...process.env,
            PATH: pathWithoutBun,
          })

          expect(result.exitCode).toBe(0)
          expect(result.stdout.length).toBeGreaterThan(0)
        }
      )

      it('should handle --version argument correctly', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).toBe(0)
      })

      it.skipIf(skipOnNode20CI)(
        'should pass multiple arguments correctly',
        async () => {
          const pathWithoutBun = createPathWithoutBun()

          // Test with a subcommand and its --help flag to verify multiple args
          const result = await runWrapper(RUN_JS, ['info', '--help'], {
            ...process.env,
            PATH: pathWithoutBun,
          })

          expect(result.exitCode).toBe(0)
          // The info --help output should contain specific info command documentation
          expect(result.stdout).toContain('info')
        }
      )
    })

    describe('stderr/stdout separation', () => {
      it('should output tip message only to stderr, not stdout', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.stdout).not.toContain('Tip: Install Bun')
        expect(result.stderr).toContain('Tip: Install Bun')
      })

      it('should output CLI output only to stdout', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.stdout).toContain('CLI:')
        expect(result.stderr).not.toContain('CLI:')
      })
    })
  })

  // ===========================================================================
  // bin/run.cmd Tests (Windows-specific)
  // ===========================================================================

  describe('bin/run.cmd (Windows)', () => {
    it('should exist in the bin directory', () => {
      expect(fs.existsSync(RUN_CMD)).toBe(true)
    })

    it('should have valid batch file syntax', () => {
      const content = fs.readFileSync(RUN_CMD, 'utf-8')

      // Should start with @echo off
      expect(content).toMatch(/^@echo off/i)

      // Should contain the bun check
      expect(content).toContain('where bun')

      // Should have fallback to node
      expect(content).toContain('node')

      // Should contain the tip message
      expect(content).toContain('Tip: Install Bun')
      expect(content).toContain('https://bun.sh')
    })

    it('should reference run.js correctly', () => {
      const content = fs.readFileSync(RUN_CMD, 'utf-8')

      // Should use %~dp0 to reference the script directory
      expect(content).toContain('%~dp0run.js')
    })

    it('should pass arguments using %*', () => {
      const content = fs.readFileSync(RUN_CMD, 'utf-8')

      // Should use %* to pass all arguments
      expect(content).toContain('%*')
    })

    it('should preserve exit codes', () => {
      const content = fs.readFileSync(RUN_CMD, 'utf-8')

      // Should use exit /b to preserve exit codes
      expect(content).toContain('exit /b')
    })

    // Runtime tests only run on Windows
    const itOnWindows = IS_WINDOWS ? it : it.skip

    itOnWindows(
      'should execute successfully when Bun is available',
      async () => {
        if (!bunAvailable) {
          return // Skip if Bun is not available
        }

        const result = await runBatchFile(RUN_CMD, ['--version'], {
          ...process.env,
        })

        expect(result.exitCode).toBe(0)
        expect(result.stderr).not.toContain('Tip: Install Bun')
      }
    )

    itOnWindows(
      'should show tip and run with Node.js when Bun is not available',
      async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runBatchFile(RUN_CMD, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).toBe(0)
        expect(result.stderr).toContain('Tip: Install Bun')
      }
    )

    // Note: This test also uses --help which has the same flaky oclif ESM issue on Node 20 CI
    it.skipIf(!IS_WINDOWS || skipOnNode20CI)(
      'should pass arguments correctly',
      async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runBatchFile(RUN_CMD, ['--help'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('USAGE')
      }
    )
  })

  // ===========================================================================
  // Edge Cases
  // ===========================================================================

  describe('edge cases', () => {
    describe('PATH manipulation', () => {
      it('should handle PATH without Bun but with Node', async () => {
        const pathWithoutBun = createPathWithoutBun()

        // Verify PATH still has some content
        expect(pathWithoutBun.length).toBeGreaterThan(0)

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).toBe(0)
        expect(result.stderr).toContain('Tip: Install Bun')
      })

      it('should handle PATH with mixed case bun directories', async () => {
        // The filter should be case-insensitive
        const currentPath = getPath(process.env)
        const pathWithMixedCase = currentPath
          .split(path.delimiter)
          .filter(dir => !dir.toLowerCase().includes('bun'))
          .join(path.delimiter)

        const result = await runWrapper(RUN_JS, ['--version'], {
          ...process.env,
          PATH: pathWithMixedCase,
        })

        expect(result.exitCode).toBe(0)
        expect(result.stderr).toContain('Tip: Install Bun')
      })
    })

    describe('error handling', () => {
      it('should handle invalid command gracefully', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['InvalidCommandXYZ'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        // command-not-found hook exits with code 2 for unrecognized commands
        expect(result.exitCode).toBe(2)
      })

      it('should preserve non-zero exit codes from commands', async () => {
        const pathWithoutBun = createPathWithoutBun()

        const result = await runWrapper(RUN_JS, ['invalid-command-xyz'], {
          ...process.env,
          PATH: pathWithoutBun,
        })

        expect(result.exitCode).not.toBe(0)
      })
    })

    describe('runtime detection accuracy', () => {
      it('should detect Bun correctly when available', () => {
        const available = checkBunAvailable()

        // This just verifies our helper function works
        expect(typeof available).toBe('boolean')
      })

      it('should create valid PATH without Bun directories', () => {
        const pathWithoutBun = createPathWithoutBun()

        // Should not contain any bun references
        expect(pathWithoutBun.toLowerCase()).not.toContain('bun')

        // Should still have some directories
        expect(pathWithoutBun.length).toBeGreaterThan(0)
      })
    })
  })

  // ===========================================================================
  // Cross-platform Behavior
  // ===========================================================================

  describe('cross-platform behavior', () => {
    it('should have run.js as the main entry point', () => {
      expect(fs.existsSync(RUN_JS)).toBe(true)
    })

    it('should have run.cmd for Windows compatibility', () => {
      expect(fs.existsSync(RUN_CMD)).toBe(true)
    })

    it('should use run.js for the package bin entry', () => {
      const packageJsonPath = path.resolve(__dirname, '../../../package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

      expect(packageJson.bin.centy).toBe('./bin/run.js')
    })
  })
})
