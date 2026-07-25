import { describe, expect, it, vi, beforeEach } from 'vitest'

// Skip these tests in bun - they require vi.resetModules which bun doesn't support
const isBun = typeof Bun !== 'undefined'
const describeOrSkip = isBun ? describe.skip : describe

vi.mock('@grpc/grpc-js', () => ({
  loadPackageDefinition: vi.fn(),
  credentials: {
    createInsecure: vi.fn(() => 'insecure-creds'),
  },
}))

vi.mock('@grpc/proto-loader', () => ({
  loadSync: vi.fn(() => 'package-definition'),
}))

describeOrSkip('load-proto', () => {
  beforeEach(() => {
    // Note: vi.resetModules is not available in bun's test runner
    if (typeof vi.resetModules === 'function') {
      vi.resetModules()
    }
    vi.clearAllMocks()
    Reflect.deleteProperty(process.env, 'CENTY_DAEMON_ADDR')
  })

  it('should create daemon client with default address', async () => {
    const { loadPackageDefinition } = await import('@grpc/grpc-js')
    const MockClient = vi.fn()

    vi.mocked(loadPackageDefinition).mockReturnValue({
      centy: { v1: { CentyDaemon: MockClient } },
    })

    const { getDaemonClient } = await import('./load-proto.js')
    getDaemonClient()

    expect(MockClient).toHaveBeenCalledWith(
      '127.0.0.1:50051',
      'insecure-creds',
      expect.any(Object)
    )
  })

  it('should use CENTY_DAEMON_ADDR environment variable when set', async () => {
    Reflect.set(process.env, 'CENTY_DAEMON_ADDR', 'localhost:9999')

    const { loadPackageDefinition } = await import('@grpc/grpc-js')
    const MockClient = vi.fn()

    vi.mocked(loadPackageDefinition).mockReturnValue({
      centy: { v1: { CentyDaemon: MockClient } },
    })

    const { getDaemonClient } = await import('./load-proto.js')
    getDaemonClient()

    expect(MockClient).toHaveBeenCalledWith(
      'localhost:9999',
      'insecure-creds',
      expect.any(Object)
    )
  })

  it('should reuse existing client instance', async () => {
    const { loadPackageDefinition } = await import('@grpc/grpc-js')
    let constructorCallCount = 0
    class MockClient {
      mock: string
      constructor() {
        this.mock = 'client'
        constructorCallCount++
      }
    }

    vi.mocked(loadPackageDefinition).mockReturnValue({
      centy: { v1: { CentyDaemon: MockClient } },
    })

    const { getDaemonClient } = await import('./load-proto.js')
    const client1 = getDaemonClient()
    const client2 = getDaemonClient()

    expect(client1).toBe(client2)
    expect(constructorCallCount).toBe(1)
  })
})
