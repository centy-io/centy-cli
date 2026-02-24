/**
 * Helper to run the centy CLI binary as a subprocess in E2E tests.
 * Points the CLI at a mock gRPC server via CENTY_DAEMON_ADDR.
 */
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import nodePath from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(currentDir, '../..')
const BIN_PATH = join(PROJECT_ROOT, 'bin/run.js')

export interface CliResult {
  stdout: string
  stderr: string
  exitCode: number
}

export interface RunCliOptions {
  /** Address of the mock gRPC server (e.g., '127.0.0.1:12345') */
  daemonAddr: string
  /** Sets CENTY_CWD so resolveProjectPath uses this path without daemon calls */
  projectCwd?: string
  /** Timeout in milliseconds (default: 15000) */
  timeout?: number
  /** Additional env vars to merge */
  env?: NodeJS.ProcessEnv
}

/**
 * Returns the system PATH without Bun directories.
 * Prevents bin/run.js from re-executing under Bun during tests.
 */
function getPathWithoutBun(): string {
  const currentPath = process.env['PATH'] ?? ''
  return currentPath
    .split(nodePath.delimiter)
    .filter(dir => !dir.toLowerCase().includes('bun'))
    .join(nodePath.delimiter)
}

/**
 * Run the compiled centy CLI binary with the given arguments.
 * The CLI is pointed at the provided mock gRPC server address.
 */
export function runCli(
  args: string[],
  options: RunCliOptions
): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      ...options.env,
      CENTY_DAEMON_ADDR: options.daemonAddr,
      PATH: getPathWithoutBun(),
    }

    if (options.projectCwd !== undefined) {
      env['CENTY_CWD'] = options.projectCwd
    }

    const child = spawn('node', [BIN_PATH, ...args], {
      env,
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    const timeoutMs = options.timeout ?? 15_000
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error(`CLI timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    child.on('close', exitCode => {
      clearTimeout(timer)
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: exitCode ?? 0,
      })
    })

    child.on('error', reject)
  })
}
