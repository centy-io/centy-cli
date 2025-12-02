import { spawn } from 'child_process'
import { mkdir, rm, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

const PROJECT_ROOT = process.cwd()

describe('cli', () => {
  const runCli = (
    args: string[],
    cwd?: string
  ): Promise<{ stdout: string; stderr: string; code: number | null }> => {
    return new Promise(resolve => {
      const devScript = join(PROJECT_ROOT, 'bin/dev.js')
      const env = { ...process.env }
      if (cwd !== undefined) {
        env['CENTY_CWD'] = cwd
      }
      const proc = spawn('node', [devScript, ...args], {
        cwd: PROJECT_ROOT,
        env,
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
      // oclif outputs version as package name/version
      expect(result.stdout).toMatch(/centy/)
      expect(result.code).toBe(0)
    })
  })

  describe('--help', () => {
    it('should print help when called with --help', async () => {
      const result = await runCli(['--help'])
      // oclif has different help format
      expect(result.stdout).toContain('COMMANDS')
      expect(result.code).toBe(0)
    })

    it('should print help when called with no arguments', async () => {
      const result = await runCli([])
      // oclif shows help by default when no command
      expect(result.stdout).toContain('COMMANDS')
      expect(result.code).toBe(0)
    })
  })

  describe('unknown command', () => {
    it('should print error for unknown command', async () => {
      const result = await runCli(['unknown'])
      // oclif outputs error to stderr
      expect(result.stderr).toContain('command unknown not found')
      expect(result.code).toBe(2)
    })
  })

  describe('init', () => {
    let tempDir: string

    beforeEach(async () => {
      tempDir = join(tmpdir(), `centy-test-${Date.now()}`)
      await mkdir(tempDir, { recursive: true })
    })

    afterEach(async () => {
      await rm(tempDir, { recursive: true, force: true })
    })

    it('should create .centy folder with force flag', async () => {
      const result = await runCli(['init', '--force'], tempDir)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Creating .centy folder')
      expect(result.stdout).toContain('Successfully initialized')

      // Verify folder structure
      const centyPath = join(tempDir, '.centy')
      const entries = await readdir(centyPath)
      expect(entries).toContain('issues')
      expect(entries).toContain('docs')
      expect(entries).toContain('README.md')
      expect(entries).toContain('.centy-manifest.json')
    })

    it('should create README.md with correct content', async () => {
      await runCli(['init', '--force'], tempDir)

      const readmePath = join(tempDir, '.centy', 'README.md')
      const content = await readFile(readmePath, 'utf8')
      expect(content).toContain('For AI Assistants')
      expect(content).toContain('issues/')
      expect(content).toContain('docs/')
    })

    it('should create manifest file', async () => {
      await runCli(['init', '--force'], tempDir)

      const manifestPath = join(tempDir, '.centy', '.centy-manifest.json')
      const content = await readFile(manifestPath, 'utf8')
      const manifest = JSON.parse(content)
      expect(manifest.schemaVersion).toBe(1)
      expect(manifest.managedFiles).toBeInstanceOf(Array)
      expect(manifest.managedFiles.length).toBeGreaterThan(0)
    })

    it('should detect existing folder and report', async () => {
      // First init
      await runCli(['init', '--force'], tempDir)

      // Second init
      const result = await runCli(['init', '--force'], tempDir)
      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Found existing .centy folder')
    })
  })
})
