import { describe, expect, it } from 'vitest'
import { buildServiceImplementation } from './grpc-service-builder.js'

describe('buildServiceImplementation', () => {
  it('should return an object with one key per service method', () => {
    const service = {
      GetItem: {},
      ListItems: {},
    } as never

    const handlers = new Map()
    const grpcStatus = { INTERNAL: 13, UNIMPLEMENTED: 12 }

    const impl = buildServiceImplementation(service, handlers, grpcStatus)

    expect(Object.keys(impl)).toContain('getItem')
    expect(Object.keys(impl)).toContain('listItems')
  })

  it('should convert PascalCase method names to camelCase', () => {
    const service = { UpdateItemStatus: {} } as never
    const handlers = new Map()
    const grpcStatus = { INTERNAL: 13, UNIMPLEMENTED: 12 }

    const impl = buildServiceImplementation(service, handlers, grpcStatus)

    expect(Object.keys(impl)).toContain('updateItemStatus')
    expect(Object.keys(impl)).not.toContain('UpdateItemStatus')
  })

  it('should return an implementation for every method in the service', () => {
    const service = {
      CreateItem: {},
      DeleteItem: {},
      GetItem: {},
    } as never

    const handlers = new Map()
    const grpcStatus = { INTERNAL: 13, UNIMPLEMENTED: 12 }

    const impl = buildServiceImplementation(service, handlers, grpcStatus)

    expect(typeof impl['createItem']).toBe('function')
    expect(typeof impl['deleteItem']).toBe('function')
    expect(typeof impl['getItem']).toBe('function')
  })
})
