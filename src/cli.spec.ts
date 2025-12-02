import { spawn } from 'child_process'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('cli', () => {
  const runCli = (
    args: string[]
  ): Promise<{ stdout: string; stderr: string; code: number | null }> => {
    return new Promise(resolve => {
      const proc = spawn('node', ['--import', 'tsx', 'src/cli.ts', ...args], {
        cwd: process.cwd(),
      })
      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', data => {
        stdout += data.toString()
      })

      proc.stderr.on('data', data => {
        stderr += data.toString()
      })

      proc.on('close', code => {
        resolve({ stdout, stderr, code })
      })
    })
  }

  describe('--version', () => {
    it('should print version when called with --version', async () => {
      const result = await runCli(['--version'])
      expect(result.stdout).toContain('centy v')
      expect(result.code).toBe(0)
    })

    it('should print version when called with -v', async () => {
      const result = await runCli(['-v'])
      expect(result.stdout).toContain('centy v')
      expect(result.code).toBe(0)
    })
  })

  describe('--help', () => {
    it('should print help when called with --help', async () => {
      const result = await runCli(['--help'])
      expect(result.stdout).toContain('centy - Project management via code')
      expect(result.stdout).toContain('Usage:')
      expect(result.code).toBe(0)
    })

    it('should print help when called with -h', async () => {
      const result = await runCli(['-h'])
      expect(result.stdout).toContain('centy - Project management via code')
      expect(result.code).toBe(0)
    })

    it('should print help when called with no arguments', async () => {
      const result = await runCli([])
      expect(result.stdout).toContain('centy - Project management via code')
      expect(result.code).toBe(0)
    })
  })

  describe('unknown command', () => {
    it('should print error for unknown command', async () => {
      const result = await runCli(['unknown'])
      expect(result.stdout).toContain('Unknown command: unknown')
      expect(result.code).toBe(1)
    })
  })
})
