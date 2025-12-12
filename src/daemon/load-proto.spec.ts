import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@grpc/grpc-js', () => ({
  loadPackageDefinition: vi.fn(),
  credentials: {
    createInsecure: vi.fn(() => 'insecure-creds'),
  },
}))

vi.mock('@grpc/proto-loader', () => ({
  loadSync: vi.fn(() => 'package-definition'),
}))

describe('load-proto', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    // eslint-disable-next-line no-restricted-syntax
    delete process.env['CENTY_DAEMON_ADDR']
  })

  it('should create daemon client with default address', async () => {
    const { loadPackageDefinition } = await import('@grpc/grpc-js')
    const MockClient = vi.fn()
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(loadPackageDefinition).mockReturnValue({
      centy: { CentyDaemon: MockClient },
    } as never)

    const { getDaemonClient } = await import('./load-proto.js')
    getDaemonClient()

    expect(MockClient).toHaveBeenCalledWith('127.0.0.1:50051', 'insecure-creds')
  })

  it('should use CENTY_DAEMON_ADDR environment variable when set', async () => {
    // eslint-disable-next-line no-restricted-syntax
    process.env['CENTY_DAEMON_ADDR'] = 'localhost:9999'

    const { loadPackageDefinition } = await import('@grpc/grpc-js')
    const MockClient = vi.fn()
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(loadPackageDefinition).mockReturnValue({
      centy: { CentyDaemon: MockClient },
    } as never)

    const { getDaemonClient } = await import('./load-proto.js')
    getDaemonClient()

    expect(MockClient).toHaveBeenCalledWith('localhost:9999', 'insecure-creds')
  })

  it('should reuse existing client instance', async () => {
    const { loadPackageDefinition } = await import('@grpc/grpc-js')
    let constructorCallCount = 0
    class MockClient {
      // eslint-disable-next-line no-restricted-syntax
      mock = 'client'
      constructor() {
        constructorCallCount++
      }
    }
    // eslint-disable-next-line no-restricted-syntax
    vi.mocked(loadPackageDefinition).mockReturnValue({
      centy: { CentyDaemon: MockClient },
    } as never)

    const { getDaemonClient } = await import('./load-proto.js')
    const client1 = getDaemonClient()
    const client2 = getDaemonClient()

    expect(client1).toBe(client2)
    expect(constructorCallCount).toBe(1)
  })
})
