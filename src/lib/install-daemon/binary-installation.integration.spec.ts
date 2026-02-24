/* eslint-disable security/detect-non-literal-fs-filename -- Integration test uses controlled temp paths */
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
  existsSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execSync, spawnSync } from 'node:child_process'
import { describe, it, expect, afterEach } from 'vitest'
import {
  getBinaryFileName,
  getArchiveExtension,
  isWindows,
} from './platform.js'
import { makeExecutable } from './make-executable.js'
import { getInstallDir } from './get-install-dir.js'
import { extractArchive } from './extract.js'

// =============================================================================
// Constants
// =============================================================================

const IS_WINDOWS = process.platform === 'win32'
const IS_UNIX = !IS_WINDOWS

// =============================================================================
// Helper Functions
// =============================================================================

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), 'centy-install-test-'))
}

function createTestBinary(dir: string, name: string): string {
  const filePath = join(dir, name)
  writeFileSync(filePath, '#!/bin/sh\necho "centy-daemon"\n', { mode: 0o644 })
  return filePath
}

function getFileName(filePath: string): string {
  const parts = filePath.split('/')
  const last = parts.at(-1)
  return last !== undefined ? last : filePath
}

function createTarGz(archivePath: string, sourceFile: string): void {
  const file = getFileName(sourceFile)
  execSync(`tar -czf "${archivePath}" -C "${join(sourceFile, '..')}" "${file}"`)
}

function checkUnzipAvailable(): boolean {
  const result = spawnSync('unzip', ['--version'], { encoding: 'utf-8' })
  return result.status === 0
}

function checkZipAvailable(): boolean {
  const result = spawnSync('zip', ['--version'], { encoding: 'utf-8' })
  return result.status === 0
}

function createZip(archivePath: string, sourceFile: string): void {
  const dir = join(sourceFile, '..')
  execSync(`zip -j "${archivePath}" "${sourceFile}"`, { cwd: dir })
}

// =============================================================================
// Tests
// =============================================================================

describe('binary installation - platform detection', () => {
  it('should correctly identify the current platform', () => {
    expect(isWindows()).toBe(process.platform === 'win32')
  })

  it('should return correct archive extension for platform', () => {
    const ext = getArchiveExtension()
    if (IS_WINDOWS) {
      expect(ext).toBe('zip')
    } else {
      expect(ext).toBe('tar.gz')
    }
  })
})

describe('binary installation - .exe suffix handling', () => {
  it('should append .exe suffix on Windows', () => {
    if (!IS_WINDOWS) return
    expect(getBinaryFileName('centy-daemon')).toBe('centy-daemon.exe')
  })

  it('should not append .exe suffix on Unix', () => {
    if (!IS_UNIX) return
    expect(getBinaryFileName('centy-daemon')).toBe('centy-daemon')
  })

  it('should return platform-correct binary name', () => {
    const result = getBinaryFileName('centy-daemon')
    const expected = IS_WINDOWS ? 'centy-daemon.exe' : 'centy-daemon'
    expect(result).toBe(expected)
  })
})

describe('binary installation - binary path resolution', () => {
  it('should resolve install dir to ~/.centy/bin', () => {
    const installDir = getInstallDir()
    expect(installDir).toContain('.centy')
    expect(installDir).toContain('bin')
  })

  it('should place install dir under user home directory', () => {
    const installDir = getInstallDir()
    // eslint-disable-next-line no-restricted-syntax
    const homeDir = process.env['HOME'] ?? process.env['USERPROFILE'] ?? ''
    expect(installDir.startsWith(homeDir)).toBe(true)
  })

  it('should return consistent install dir on repeated calls', () => {
    expect(getInstallDir()).toBe(getInstallDir())
  })
})

describe('binary installation - chmod permission setting on Unix', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true })
    }
    tempDirs.length = 0
  })

  it.skipIf(IS_WINDOWS)(
    'should set executable permissions (0o755) on Unix',
    () => {
      const tempDir = createTempDir()
      tempDirs.push(tempDir)

      const binaryPath = createTestBinary(tempDir, 'test-binary')
      makeExecutable(binaryPath)

      const stat = statSync(binaryPath)
      // Check owner execute bit (0o100) and group execute bit (0o010) and other execute bit (0o001)
      const mode = stat.mode & 0o777
      expect(mode).toBe(0o755)
    }
  )

  it.skipIf(IS_WINDOWS)(
    'should allow the file to be executed after makeExecutable',
    () => {
      const tempDir = createTempDir()
      tempDirs.push(tempDir)

      const binaryPath = createTestBinary(tempDir, 'test-exec')
      makeExecutable(binaryPath)

      const stat = statSync(binaryPath)
      const isExecutable = !!(stat.mode & 0o111)
      expect(isExecutable).toBe(true)
    }
  )

  it.skipIf(IS_UNIX)(
    'should skip chmod on Windows (makeExecutable is a no-op)',
    () => {
      const tempDir = createTempDir()
      tempDirs.push(tempDir)

      const binaryPath = createTestBinary(tempDir, 'test-binary.exe')
      // Should not throw on Windows
      expect(() => makeExecutable(binaryPath)).not.toThrow()
    }
  )
})

describe('binary installation - tar/unzip extraction on Unix', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true })
    }
    tempDirs.length = 0
  })

  it.skipIf(IS_WINDOWS)(
    'should extract .tar.gz archives using tar on Unix',
    () => {
      const tempDir = createTempDir()
      tempDirs.push(tempDir)

      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir)
      createTestBinary(srcDir, 'centy-daemon')

      const archivePath = join(tempDir, 'centy-daemon.tar.gz')
      createTarGz(archivePath, join(srcDir, 'centy-daemon'))

      const destDir = join(tempDir, 'dest')
      extractArchive(archivePath, destDir)

      expect(existsSync(join(destDir, 'centy-daemon'))).toBe(true)
    }
  )

  it.skipIf(IS_WINDOWS || !checkUnzipAvailable())(
    'should extract .zip archives using unzip on Unix',
    () => {
      if (!checkZipAvailable()) return

      const tempDir = createTempDir()
      tempDirs.push(tempDir)

      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir)
      createTestBinary(srcDir, 'centy-daemon')

      const archivePath = join(tempDir, 'centy-daemon.zip')
      createZip(archivePath, join(srcDir, 'centy-daemon'))

      const destDir = join(tempDir, 'dest')
      extractArchive(archivePath, destDir)

      expect(existsSync(join(destDir, 'centy-daemon'))).toBe(true)
    }
  )
})

describe('binary installation - PowerShell Expand-Archive on Windows', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true })
    }
    tempDirs.length = 0
  })

  it.skipIf(IS_UNIX)(
    'should extract .zip archives using PowerShell Expand-Archive on Windows',
    () => {
      const tempDir = createTempDir()
      tempDirs.push(tempDir)

      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir)
      createTestBinary(srcDir, 'centy-daemon.exe')

      // Create zip using PowerShell
      const archivePath = join(tempDir, 'centy-daemon.zip')
      execSync(
        `powershell -Command "Compress-Archive -Path '${join(srcDir, 'centy-daemon.exe')}' -DestinationPath '${archivePath}'"`,
        { stdio: 'pipe' }
      )

      const destDir = join(tempDir, 'dest')
      extractArchive(archivePath, destDir)

      expect(existsSync(join(destDir, 'centy-daemon.exe'))).toBe(true)
    }
  )
})

describe('binary installation - full flow on current platform', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true })
    }
    tempDirs.length = 0
  })

  it('should determine the correct binary name for the current platform', () => {
    const binaryName = getBinaryFileName('centy-daemon')
    expect(binaryName).toBe(IS_WINDOWS ? 'centy-daemon.exe' : 'centy-daemon')
  })

  it('should determine the correct archive extension for the current platform', () => {
    const ext = getArchiveExtension()
    expect(ext).toBe(IS_WINDOWS ? 'zip' : 'tar.gz')
  })

  it.skipIf(IS_WINDOWS)(
    'should complete a full install flow on Unix (extract tar.gz + chmod)',
    () => {
      const tempDir = createTempDir()
      tempDirs.push(tempDir)

      const srcDir = join(tempDir, 'src')
      mkdirSync(srcDir)
      const binaryName = getBinaryFileName('centy-daemon')
      createTestBinary(srcDir, binaryName)

      const archivePath = join(tempDir, `centy-daemon.${getArchiveExtension()}`)
      createTarGz(archivePath, join(srcDir, binaryName))

      const destDir = join(tempDir, 'dest')
      extractArchive(archivePath, destDir)

      const installedBinary = join(destDir, binaryName)
      expect(existsSync(installedBinary)).toBe(true)

      makeExecutable(installedBinary)
      const stat = statSync(installedBinary)
      expect(stat.mode & 0o111).toBeGreaterThan(0)
    }
  )
})
