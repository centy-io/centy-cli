/* eslint-disable no-restricted-syntax */
import { describe, expect, it, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { daemonGetSupportedEditors } from './daemon-get-supported-editors.js'

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

describe('daemonGetSupportedEditors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve with editors on success', async () => {
    const mockResponse = {
      editors: [
        {
          editorType: 'EDITOR_TYPE_VSCODE',
          name: 'VS Code',
          description: 'Visual Studio Code',
          available: true,
          editorId: 'vscode',
          terminalWrapper: false,
        },
        {
          editorType: 'EDITOR_TYPE_TERMINAL',
          name: 'Terminal',
          description: 'Terminal editor',
          available: true,
          editorId: 'terminal',
          terminalWrapper: true,
        },
      ],
    }
    const mockClient = {
      getSupportedEditors: vi.fn((_req, _options, callback) => {
        callback(null, mockResponse)
      }),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    const result = await daemonGetSupportedEditors({})

    expect(result).toEqual(mockResponse)
    expect(mockClient.getSupportedEditors).toHaveBeenCalled()
  })

  it('should reject with error on failure', async () => {
    const mockError = new Error('gRPC error')
    const mockClient = {
      getSupportedEditors: vi.fn((_req, _options, callback) => {
        callback(mockError, null)
      }),
    }

    ;(getDaemonClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClient as never
    )

    await expect(daemonGetSupportedEditors({})).rejects.toThrow('gRPC error')
  })
})
