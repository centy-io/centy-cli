import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createMockCommand,
  runCommandSafely,
} from '../testing/command-test-utils.js'

const mockEnsureInitialized = vi.fn()
const mockResolveProjectPath = vi.fn()
const mockDaemonListUncompactedIssues = vi.fn()
const mockDaemonGetInstruction = vi.fn()
const mockDaemonGetCompact = vi.fn()
const mockDaemonSaveMigration = vi.fn()
const mockDaemonUpdateCompact = vi.fn()
const mockDaemonMarkIssuesCompacted = vi.fn()
const mockWriteFile = vi.fn()
const mockReadFile = vi.fn()

vi.mock('../utils/ensure-initialized.js', () => ({
  ensureInitialized: (...args: unknown[]) => mockEnsureInitialized(...args),
  NotInitializedError: class NotInitializedError extends Error {
    constructor(message = 'Not initialized') {
      super(message)
      this.name = 'NotInitializedError'
    }
  },
}))

vi.mock('../utils/resolve-project-path.js', () => ({
  resolveProjectPath: (...args: unknown[]) => mockResolveProjectPath(...args),
}))

vi.mock('../daemon/daemon-list-uncompacted-issues.js', () => ({
  daemonListUncompactedIssues: (...args: unknown[]) =>
    mockDaemonListUncompactedIssues(...args),
}))

vi.mock('../daemon/daemon-get-instruction.js', () => ({
  daemonGetInstruction: (...args: unknown[]) =>
    mockDaemonGetInstruction(...args),
}))

vi.mock('../daemon/daemon-get-compact.js', () => ({
  daemonGetCompact: (...args: unknown[]) => mockDaemonGetCompact(...args),
}))

vi.mock('../daemon/daemon-save-migration.js', () => ({
  daemonSaveMigration: (...args: unknown[]) => mockDaemonSaveMigration(...args),
}))

vi.mock('../daemon/daemon-update-compact.js', () => ({
  daemonUpdateCompact: (...args: unknown[]) => mockDaemonUpdateCompact(...args),
}))

vi.mock('../daemon/daemon-mark-issues-compacted.js', () => ({
  daemonMarkIssuesCompacted: (...args: unknown[]) =>
    mockDaemonMarkIssuesCompacted(...args),
}))

vi.mock('node:fs/promises', () => ({
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  readFile: (...args: unknown[]) => mockReadFile(...args),
}))

describe('Compact command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolveProjectPath.mockResolvedValue('/test/project')
    mockEnsureInitialized.mockResolvedValue('/test/project/.centy')
  })

  it('should have correct static properties', async () => {
    const { default: Command } = await import('./compact.js')

    expect(Command.description).toBeDefined()
    expect(typeof Command.description).toBe('string')
  })

  it('should export a valid oclif command class', async () => {
    const { default: Command } = await import('./compact.js')

    expect(Command).toBeDefined()
    expect(Command.prototype.run).toBeDefined()
  })

  it('should handle NotInitializedError', async () => {
    const { default: Command } = await import('./compact.js')
    const { NotInitializedError } =
      await import('../utils/ensure-initialized.js')
    mockEnsureInitialized.mockRejectedValue(
      new NotInitializedError('Project not initialized')
    )

    const cmd = createMockCommand(Command, { flags: {} })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(cmd.errors).toContain('Project not initialized')
  })

  it('should log message when no issues to compact', async () => {
    const { default: Command } = await import('./compact.js')
    mockDaemonListUncompactedIssues.mockResolvedValue({
      issues: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, { flags: {} })
    await cmd.run()

    expect(cmd.logs).toContain('No new issues to compact.')
  })

  describe('dry-run mode', () => {
    it('should list uncompacted issues in dry-run mode', async () => {
      const { default: Command } = await import('./compact.js')
      mockDaemonListUncompactedIssues.mockResolvedValue({
        issues: [
          {
            id: 'uuid-1',
            displayNumber: 1,
            title: 'Issue 1',
            metadata: { status: 'open' },
          },
          {
            id: 'uuid-2',
            displayNumber: 2,
            title: 'Issue 2',
            metadata: { status: 'closed' },
          },
        ],
        totalCount: 2,
      })

      const cmd = createMockCommand(Command, { flags: { 'dry-run': true } })
      await cmd.run()

      expect(cmd.logs).toContain('Found 2 uncompacted issue(s):\n')
      expect(cmd.logs.some(log => log.includes('#1 [open] Issue 1'))).toBe(true)
      expect(cmd.logs.some(log => log.includes('#2 [closed] Issue 2'))).toBe(
        true
      )
    })

    it('should output JSON in dry-run mode with json flag', async () => {
      const { default: Command } = await import('./compact.js')
      const issues = [
        { id: 'uuid-1', displayNumber: 1, title: 'Issue 1' },
        { id: 'uuid-2', displayNumber: 2, title: 'Issue 2' },
      ]
      mockDaemonListUncompactedIssues.mockResolvedValue({
        issues,
        totalCount: 2,
      })

      const cmd = createMockCommand(Command, {
        flags: { 'dry-run': true, json: true },
      })
      await cmd.run()

      expect(cmd.logs[0]).toBe(JSON.stringify(issues, null, 2))
    })

    it('should handle issues without metadata', async () => {
      const { default: Command } = await import('./compact.js')
      mockDaemonListUncompactedIssues.mockResolvedValue({
        issues: [{ id: 'uuid-1', displayNumber: 1, title: 'Issue 1' }],
        totalCount: 1,
      })

      const cmd = createMockCommand(Command, { flags: { 'dry-run': true } })
      await cmd.run()

      expect(cmd.logs.some(log => log.includes('[unknown]'))).toBe(true)
    })
  })

  describe('output mode', () => {
    it('should write LLM context to file when output flag is set', async () => {
      const { default: Command } = await import('./compact.js')
      mockDaemonListUncompactedIssues.mockResolvedValue({
        issues: [
          {
            id: 'uuid-1',
            displayNumber: 1,
            title: 'Issue 1',
            description: 'Desc 1',
          },
        ],
        totalCount: 1,
      })
      mockDaemonGetInstruction.mockResolvedValue({
        content: 'Test instruction',
      })
      mockDaemonGetCompact.mockResolvedValue({
        exists: true,
        content: 'Existing compact content',
      })
      mockWriteFile.mockResolvedValue(undefined)

      const cmd = createMockCommand(Command, {
        flags: { output: 'context.md' },
      })
      await cmd.run()

      expect(mockWriteFile).toHaveBeenCalledWith(
        'context.md',
        expect.stringContaining('# LLM Compaction Context'),
        'utf-8'
      )
      expect(cmd.logs).toContain('LLM context written to: context.md')
    })

    it('should handle non-existing compact.md', async () => {
      const { default: Command } = await import('./compact.js')
      mockDaemonListUncompactedIssues.mockResolvedValue({
        issues: [
          {
            id: 'uuid-1',
            displayNumber: 1,
            title: 'Issue 1',
            description: '',
          },
        ],
        totalCount: 1,
      })
      mockDaemonGetInstruction.mockResolvedValue({ content: 'Instructions' })
      mockDaemonGetCompact.mockResolvedValue({ exists: false, content: '' })
      mockWriteFile.mockResolvedValue(undefined)

      const cmd = createMockCommand(Command, {
        flags: { output: 'context.md' },
      })
      await cmd.run()

      expect(mockWriteFile).toHaveBeenCalledWith(
        'context.md',
        expect.stringContaining('(No features documented yet)'),
        'utf-8'
      )
    })
  })

  describe('input mode (apply LLM response)', () => {
    it('should apply LLM response from file with code blocks', async () => {
      const { default: Command } = await import('./compact.js')
      const llmResponse = `
### MIGRATION_CONTENT
\`\`\`yaml
title: Feature migration
compactedIssues:
  - id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
\`\`\`

### COMPACT_CONTENT
\`\`\`markdown
# Features
- Feature 1
\`\`\`
`
      mockReadFile.mockResolvedValue(llmResponse)
      mockDaemonSaveMigration.mockResolvedValue({
        success: true,
        filename: 'migration-001.md',
      })
      mockDaemonUpdateCompact.mockResolvedValue({ success: true })
      mockDaemonMarkIssuesCompacted.mockResolvedValue({
        success: true,
        markedCount: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: { input: 'response.md' },
      })
      await cmd.run()

      expect(mockReadFile).toHaveBeenCalledWith('response.md', 'utf-8')
      expect(mockDaemonSaveMigration).toHaveBeenCalled()
      expect(mockDaemonUpdateCompact).toHaveBeenCalled()
      expect(mockDaemonMarkIssuesCompacted).toHaveBeenCalledWith(
        expect.objectContaining({
          issueIds: expect.arrayContaining([
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          ]),
        })
      )
      expect(cmd.logs).toContain('Compaction applied successfully!')
    })

    it('should apply LLM response with alternative format (no code blocks)', async () => {
      const { default: Command } = await import('./compact.js')
      const llmResponse = `
### MIGRATION_CONTENT
title: Feature migration
issueId: b2c3d4e5-f6a7-8901-bcde-f12345678901

### COMPACT_CONTENT
# Features
- Feature 2
`
      mockReadFile.mockResolvedValue(llmResponse)
      mockDaemonSaveMigration.mockResolvedValue({
        success: true,
        filename: 'migration-002.md',
      })
      mockDaemonUpdateCompact.mockResolvedValue({ success: true })
      mockDaemonMarkIssuesCompacted.mockResolvedValue({
        success: true,
        markedCount: 1,
      })

      const cmd = createMockCommand(Command, {
        flags: { input: 'response.md' },
      })
      await cmd.run()

      expect(mockDaemonSaveMigration).toHaveBeenCalled()
      expect(mockDaemonUpdateCompact).toHaveBeenCalled()
    })

    it('should error when cannot parse LLM response', async () => {
      const { default: Command } = await import('./compact.js')
      mockReadFile.mockResolvedValue('Invalid content without sections')

      const cmd = createMockCommand(Command, {
        flags: { input: 'response.md' },
      })
      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('Could not parse LLM response')
    })

    it('should warn when no issue IDs found in migration', async () => {
      const { default: Command } = await import('./compact.js')
      const llmResponse = `
### MIGRATION_CONTENT
\`\`\`yaml
title: Feature migration
\`\`\`

### COMPACT_CONTENT
\`\`\`markdown
# Features
\`\`\`
`
      mockReadFile.mockResolvedValue(llmResponse)
      mockDaemonSaveMigration.mockResolvedValue({
        success: true,
        filename: 'migration.md',
      })
      mockDaemonUpdateCompact.mockResolvedValue({ success: true })

      const cmd = createMockCommand(Command, {
        flags: { input: 'response.md' },
      })
      await cmd.run()

      expect(cmd.warnings).toContain(
        'No issue IDs found in migration content. Issues will not be marked as compacted.'
      )
    })

    it('should handle migration save failure', async () => {
      const { default: Command } = await import('./compact.js')
      const llmResponse = `
### MIGRATION_CONTENT
\`\`\`yaml
id: uuid-123
\`\`\`

### COMPACT_CONTENT
\`\`\`markdown
# Features
\`\`\`
`
      mockReadFile.mockResolvedValue(llmResponse)
      mockDaemonSaveMigration.mockResolvedValue({
        success: false,
        error: 'Disk full',
      })

      const cmd = createMockCommand(Command, {
        flags: { input: 'response.md' },
      })
      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('Failed to save migration')
    })

    it('should handle compact update failure', async () => {
      const { default: Command } = await import('./compact.js')
      const llmResponse = `
### COMPACT_CONTENT
\`\`\`markdown
# Features
\`\`\`
`
      mockReadFile.mockResolvedValue(llmResponse)
      mockDaemonUpdateCompact.mockResolvedValue({
        success: false,
        error: 'Write error',
      })

      const cmd = createMockCommand(Command, {
        flags: { input: 'response.md' },
      })
      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('Failed to update compact.md')
    })

    it('should handle mark issues compacted failure', async () => {
      const { default: Command } = await import('./compact.js')
      const llmResponse = `
### MIGRATION_CONTENT
\`\`\`yaml
id: c3d4e5f6-a7b8-9012-cdef-123456789012
\`\`\`

### COMPACT_CONTENT
\`\`\`markdown
# Features
\`\`\`
`
      mockReadFile.mockResolvedValue(llmResponse)
      mockDaemonSaveMigration.mockResolvedValue({
        success: true,
        filename: 'migration.md',
      })
      mockDaemonUpdateCompact.mockResolvedValue({ success: true })
      mockDaemonMarkIssuesCompacted.mockResolvedValue({
        success: false,
        error: 'Database error',
      })

      const cmd = createMockCommand(Command, {
        flags: { input: 'response.md' },
      })
      const { error } = await runCommandSafely(cmd)

      expect(error).toBeDefined()
      expect(cmd.errors[0]).toContain('Failed to mark issues as compacted')
    })
  })

  describe('default mode (generate context to stdout)', () => {
    it('should output LLM context to stdout when no flags', async () => {
      const { default: Command } = await import('./compact.js')
      mockDaemonListUncompactedIssues.mockResolvedValue({
        issues: [
          {
            id: 'uuid-1',
            displayNumber: 1,
            title: 'Issue 1',
            description: 'Description 1',
          },
        ],
        totalCount: 1,
      })
      mockDaemonGetInstruction.mockResolvedValue({ content: 'Instructions' })
      mockDaemonGetCompact.mockResolvedValue({
        exists: true,
        content: 'Current features',
      })

      const cmd = createMockCommand(Command, { flags: {} })
      await cmd.run()

      expect(
        cmd.logs.some(log => log.includes('# LLM Compaction Context'))
      ).toBe(true)
      expect(cmd.logs.some(log => log.includes('## Instructions'))).toBe(true)
      expect(
        cmd.logs.some(log => log.includes('## Current Features Summary'))
      ).toBe(true)
      expect(cmd.logs.some(log => log.includes('## Uncompacted Issues'))).toBe(
        true
      )
    })
  })

  it('should rethrow non-NotInitializedError errors', async () => {
    const { default: Command } = await import('./compact.js')
    mockEnsureInitialized.mockRejectedValue(new Error('Unknown error'))

    const cmd = createMockCommand(Command, { flags: {} })
    const { error } = await runCommandSafely(cmd)

    expect(error).toBeDefined()
    expect(error).toHaveProperty('message', 'Unknown error')
  })

  it('should use project flag to resolve path', async () => {
    const { default: Command } = await import('./compact.js')
    mockResolveProjectPath.mockResolvedValue('/other/project')
    mockDaemonListUncompactedIssues.mockResolvedValue({
      issues: [],
      totalCount: 0,
    })

    const cmd = createMockCommand(Command, {
      flags: { project: 'other-project' },
    })

    await cmd.run()

    expect(mockResolveProjectPath).toHaveBeenCalledWith('other-project')
    expect(mockDaemonListUncompactedIssues).toHaveBeenCalledWith({
      projectPath: '/other/project',
    })
  })
})
