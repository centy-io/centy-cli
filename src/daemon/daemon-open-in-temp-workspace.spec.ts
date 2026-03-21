
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { daemonOpenInTempWorkspace } from './daemon-open-in-temp-workspace.js'
import { getDaemonClient } from './load-proto.js'

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


describe('daemonOpenInTempWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with response on success', async () => {
    const mockResponse = { success: true, workspacePath: '/tmp/workspace' }
    const mockClient = {
      openInTempWorkspace: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    ;vi.mocked(getDaemonClient).mockReturnValue(
      mockClient
    )

    const result = await daemonOpenInTempWorkspace({
      projectPath: '/test',
      issueId: '123',
      editorType: 'vscode',
    })

    expect(result).toEqual(mockResponse)
    expect(mockClient.openInTempWorkspace).toHaveBeenCalled()
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      openInTempWorkspace: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    ;vi.mocked(getDaemonClient).mockReturnValue(
      mockClient
    )

    await expect(
      daemonOpenInTempWorkspace({
        projectPath: '/test',
        issueId: '123',
        editorType: 'vscode',
      })
    ).rejects.toThrow('gRPC error')
  })
})
