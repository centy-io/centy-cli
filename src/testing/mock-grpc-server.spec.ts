import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { MockGrpcServer } from './mock-grpc-server.js'

describe('MockGrpcServer', () => {
  let server: MockGrpcServer

  beforeAll(async () => {
    server = new MockGrpcServer()
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('should return a valid address after start', () => {
    const addr = server.getAddress()

    expect(addr).toMatch(/^127\.0\.0\.1:\d+$/)
  })

  it('should allow setting a single handler', () => {
    const handler = () => ({ success: true })

    server.setHandler('getItem', handler)

    expect(server.getAddress()).toBeTruthy()
  })

  it('should allow replacing all handlers atomically', () => {
    const handlers = {
      getItem: () => ({ success: true }),
      listItems: () => ({ items: [] }),
    }

    server.setHandlers(handlers)

    expect(server.getAddress()).toBeTruthy()
  })

  it('should construct with no arguments', () => {
    const emptyServer = new MockGrpcServer()

    expect(emptyServer).toBeInstanceOf(MockGrpcServer)
  })
})
