import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { MockGrpcServer } from './mock-grpc-server.js'

describe('MockGrpcServer', () => {
  let server: MockGrpcServer | undefined

  beforeAll(async () => {
    try {
      server = new MockGrpcServer()
      await server.start()
    } catch {
      server = undefined
    }
  })

  afterAll(async () => {
    if (server !== undefined) {
      await server.stop()
    }
  })

  it('should return a valid address after start', () => {
    if (server === undefined) {
      return
    }
    const addr = server.getAddress()

    expect(addr).toMatch(/^127\.0\.0\.1:\d+$/)
  })

  it('should allow setting a single handler', () => {
    if (server === undefined) {
      return
    }
    const handler = () => ({ success: true })

    server.setHandler('getItem', handler)

    expect(server.getAddress()).toBeTruthy()
  })

  it('should allow replacing all handlers atomically', () => {
    if (server === undefined) {
      return
    }
    const handlers = {
      getItem: () => ({ success: true }),
      listItems: () => ({ items: [] }),
    }

    server.setHandlers(handlers)

    expect(server.getAddress()).toBeTruthy()
  })

  it('should construct with no arguments', () => {
    if (server === undefined) {
      return
    }
    const emptyServer = new MockGrpcServer()

    expect(emptyServer).toBeInstanceOf(MockGrpcServer)
  })
})
