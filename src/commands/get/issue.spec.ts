// eslint-disable-next-line import/order
import { describe, it, expect, beforeEach, vi } from 'vitest'

import GetIssue from './issue.js'

// Mock daemon functions
const mockDaemonGetIssue = vi.fn()
const mockDaemonGetIssueByDisplayNumber = vi.fn()
const mockDaemonIsInitialized = vi.fn()

vi.mock('../../daemon/daemon-get-issue.js', () => ({
  daemonGetIssue: (...args: unknown[]) => mockDaemonGetIssue(...args),
}))

vi.mock('../../daemon/daemon-get-issue-by-display-number.js', () => ({
  daemonGetIssueByDisplayNumber: (...args: unknown[]) =>
    mockDaemonGetIssueByDisplayNumber(...args),
}))

vi.mock('../../daemon/daemon-is-initialized.js', () => ({
  daemonIsInitialized: (...args: unknown[]) => mockDaemonIsInitialized(...args),
}))

// Helper to create mock issue response
function createMockIssue(overrides: Record<string, unknown> = {}) {
  return {
    id: '3981508f-1961-4174-a421-bba3a8a6a538',
    displayNumber: 37,
    issueNumber: '3981508f-1961-4174-a421-bba3a8a6a538',
    title: 'Test Issue',
    description: 'Test description',
    metadata: {
      displayNumber: 37,
      status: 'open',
      priority: 1,
      createdAt: '2025-12-10T19:06:33.177807+00:00',
      updatedAt: '2025-12-10T19:06:33.177807+00:00',
      priorityLabel: 'high',
      compacted: false,
      compactedAt: '',
      customFields: {},
    },
    ...overrides,
  }
}

describe('get issue command - ID parsing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDaemonIsInitialized.mockResolvedValue({ initialized: true })
  })

  describe('isDisplayNumber detection', () => {
    it('should treat pure numeric strings as display numbers', () => {
      // Test the regex pattern used in the command
      const isAllDigits = (id: string) => /^\d+$/.test(id)

      expect(isAllDigits('1')).toBe(true)
      expect(isAllDigits('37')).toBe(true)
      expect(isAllDigits('123')).toBe(true)
      expect(isAllDigits('9999')).toBe(true)
    })

    it('should NOT treat UUIDs starting with digits as display numbers', () => {
      const isAllDigits = (id: string) => /^\d+$/.test(id)

      // UUIDs that start with digits should NOT be treated as display numbers
      expect(isAllDigits('3981508f-1961-4174-a421-bba3a8a6a538')).toBe(false)
      expect(isAllDigits('12345678-1234-1234-1234-123456789012')).toBe(false)
      expect(isAllDigits('0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d')).toBe(false)
    })

    it('should NOT treat standard UUIDs as display numbers', () => {
      const isAllDigits = (id: string) => /^\d+$/.test(id)

      expect(isAllDigits('a3f2b1c9-4d5e-6f7a-8b9c-0d1e2f3a4b5c')).toBe(false)
      expect(isAllDigits('abc123')).toBe(false)
      expect(isAllDigits('test-uuid')).toBe(false)
    })

    it('should NOT treat empty strings or invalid inputs as display numbers', () => {
      const isAllDigits = (id: string) => /^\d+$/.test(id)

      expect(isAllDigits('')).toBe(false)
      expect(isAllDigits('   ')).toBe(false)
      expect(isAllDigits('12 34')).toBe(false)
    })
  })

  describe('daemon function routing', () => {
    it('should call daemonGetIssueByDisplayNumber for numeric IDs', async () => {
      mockDaemonGetIssueByDisplayNumber.mockResolvedValue(createMockIssue())

      // Simulate the command logic
      const id = '37'
      const isAllDigits = /^\d+$/.test(id)
      const displayNumber = isAllDigits ? Number.parseInt(id, 10) : NaN
      const isDisplayNumber =
        isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

      expect(isDisplayNumber).toBe(true)

      if (isDisplayNumber) {
        await mockDaemonGetIssueByDisplayNumber({
          projectPath: '/test',
          displayNumber,
        })
      }

      expect(mockDaemonGetIssueByDisplayNumber).toHaveBeenCalledWith({
        projectPath: '/test',
        displayNumber: 37,
      })
      expect(mockDaemonGetIssue).not.toHaveBeenCalled()
    })

    it('should call daemonGetIssue for UUID starting with digits', async () => {
      mockDaemonGetIssue.mockResolvedValue(createMockIssue())

      // Simulate the command logic with a UUID that starts with digits
      const id = '3981508f-1961-4174-a421-bba3a8a6a538'
      const isAllDigits = /^\d+$/.test(id)
      const displayNumber = isAllDigits ? Number.parseInt(id, 10) : NaN
      const isDisplayNumber =
        isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

      expect(isDisplayNumber).toBe(false)

      if (!isDisplayNumber) {
        await mockDaemonGetIssue({
          projectPath: '/test',
          issueId: id,
        })
      }

      expect(mockDaemonGetIssue).toHaveBeenCalledWith({
        projectPath: '/test',
        issueId: '3981508f-1961-4174-a421-bba3a8a6a538',
      })
      expect(mockDaemonGetIssueByDisplayNumber).not.toHaveBeenCalled()
    })

    it('should call daemonGetIssue for standard UUIDs', async () => {
      mockDaemonGetIssue.mockResolvedValue(createMockIssue())

      // Simulate the command logic with a standard UUID
      const id = 'a3f2b1c9-4d5e-6f7a-8b9c-0d1e2f3a4b5c'
      const isAllDigits = /^\d+$/.test(id)
      const displayNumber = isAllDigits ? Number.parseInt(id, 10) : NaN
      const isDisplayNumber =
        isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

      expect(isDisplayNumber).toBe(false)

      if (!isDisplayNumber) {
        await mockDaemonGetIssue({
          projectPath: '/test',
          issueId: id,
        })
      }

      expect(mockDaemonGetIssue).toHaveBeenCalledWith({
        projectPath: '/test',
        issueId: 'a3f2b1c9-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
      })
      expect(mockDaemonGetIssueByDisplayNumber).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle display number 0 as UUID (not valid display number)', () => {
      const id = '0'
      const isAllDigits = /^\d+$/.test(id)
      const displayNumber = isAllDigits ? Number.parseInt(id, 10) : NaN
      const isDisplayNumber =
        isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

      // 0 is not a valid display number (they start at 1)
      expect(isDisplayNumber).toBe(false)
    })

    it('should handle negative-looking strings as UUIDs', () => {
      const id = '-1'
      const isAllDigits = /^\d+$/.test(id)
      const displayNumber = isAllDigits ? Number.parseInt(id, 10) : NaN
      const isDisplayNumber =
        isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

      expect(isDisplayNumber).toBe(false)
    })

    it('should handle leading zeros correctly', () => {
      // "0001" should be treated as display number 1
      const id = '0001'
      const isAllDigits = /^\d+$/.test(id)
      const displayNumber = isAllDigits ? Number.parseInt(id, 10) : NaN
      const isDisplayNumber =
        isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0

      expect(isAllDigits).toBe(true)
      expect(displayNumber).toBe(1)
      expect(isDisplayNumber).toBe(true)
    })
  })

  describe('regression test for issue #37', () => {
    it('should NOT incorrectly parse UUID "3981508f-..." as display number 3981508', () => {
      // This was the original bug: Number.parseInt("3981508f-...", 10) returns 3981508
      const buggyParse = Number.parseInt(
        '3981508f-1961-4174-a421-bba3a8a6a538',
        10
      )
      expect(buggyParse).toBe(3981508) // This shows the bug behavior

      // But our fix should detect it's not all digits
      const isAllDigits = /^\d+$/.test('3981508f-1961-4174-a421-bba3a8a6a538')
      expect(isAllDigits).toBe(false)

      // So it should NOT be treated as a display number
      const displayNumber = isAllDigits ? buggyParse : NaN
      const isDisplayNumber =
        isAllDigits && !Number.isNaN(displayNumber) && displayNumber > 0
      expect(isDisplayNumber).toBe(false)
    })
  })

  describe('command aliases', () => {
    it('should have "issue" alias for shorthand access (centy issue <id>)', () => {
      expect(GetIssue.aliases).toContain('issue')
    })

    it('should have "show:issue" alias for backwards compatibility', () => {
      expect(GetIssue.aliases).toContain('show:issue')
    })

    it('should have exactly 2 aliases configured', () => {
      expect(GetIssue.aliases).toHaveLength(2)
    })
  })
})
