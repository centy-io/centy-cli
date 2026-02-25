/* eslint-disable no-restricted-syntax */
import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { daemonOpenStandaloneWorkspace } from './daemon-open-standalone-workspace.js'

vi.mock('./load-proto.js', () => {
  const mockCallWithDeadline = vi.fn(async (method, request, _timeout) => {
    return new Promise((resolve, reject) => {
      method(request, {}, (error: Error | null, response: unknown) => {
        if (error) reject(error)
        else resolve(response)
      })
    })
  })
  return {
    getDaemonClient: vi.fn(),
    callWithDeadline: mockCallWithDeadline,
    LONG_GRPC_TIMEOUT_MS: 120000,
  }
})

// eslint-disable-next-line import/first
import { getDaemonClient } from './load-proto.js'

describe('daemonOpenStandaloneWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = {
      success: true,
      workspacePath: '/tmp/standalone-workspace',
      workspaceId: 'uuid-123',
      name: 'my-workspace',
      expiresAt: '2024-12-15T00:00:00Z',
      editorOpened: true,
    }
    const mockClient = {
      openStandaloneWorkspace: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    const result = await daemonOpenStandaloneWorkspace({
      projectPath: '/test',
      name: 'my-workspace',
      description: '',
      ttlHours: 0,
      agentName: '',
      editorId: '',
    })

    expect(result).toEqual(mockResponse)
    expect(mockClient.openStandaloneWorkspace).toHaveBeenCalled()
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      openStandaloneWorkspace: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    await expect(
      daemonOpenStandaloneWorkspace({
        projectPath: '/test',
        name: '',
        description: '',
        ttlHours: 0,
        agentName: '',
        editorId: '',
      })
    ).rejects.toThrow('gRPC error')
  })
})
