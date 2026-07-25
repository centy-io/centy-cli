/**
 * Mock gRPC server for E2E testing.
 * Creates a real gRPC server loaded from the centy proto file,
 * allowing tests to configure per-method response handlers.
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  type Server,
  type UntypedServiceImplementation,
  Server as GrpcServer,
  ServerCredentials,
  status,
} from '@grpc/grpc-js'
import {
  buildServiceImplementation,
  loadCentyService,
} from './grpc-service-builder.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = join(currentDir, '../../proto/centy/v1/centy.proto')
const PROTO_INCLUDE_DIR = join(currentDir, '../../proto')

export type MockHandler<Req = unknown, Res = unknown> = (
  request: Req
) => Res | Promise<Res>

export type MockHandlers = Record<string, MockHandler>

/**
 * Mock gRPC server for the CentyDaemon service.
 *
 * Start it with `await server.start()`, then use the returned address
 * as `CENTY_DAEMON_ADDR` when running CLI commands.
 * Unregistered methods return UNIMPLEMENTED status.
 */
export class MockGrpcServer {
  private server: Server
  private port = 0
  private handlers: Map<string, MockHandler>

  constructor(initialHandlers?: MockHandlers) {
    this.server = new GrpcServer()
    this.handlers = new Map(Object.entries(initialHandlers ?? {}))
    const service = loadCentyService(PROTO_PATH, PROTO_INCLUDE_DIR)
    const implementations = buildServiceImplementation(
      service,
      this.handlers,
      status
    )
    this.server.addService(
      service,
      implementations as UntypedServiceImplementation
    )
  }

  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        '127.0.0.1:0',
        ServerCredentials.createInsecure(),
        (error, port) => {
          if (error !== null) {
            reject(error)
          } else {
            this.port = port
            resolve(`127.0.0.1:${port}`)
          }
        }
      )
    })
  }

  async stop(): Promise<void> {
    return new Promise(resolve => {
      this.server.tryShutdown(() => resolve())
    })
  }

  getAddress(): string {
    return `127.0.0.1:${this.port}`
  }

  /** Replace all active handlers atomically (useful in beforeEach). */
  setHandlers(handlers: MockHandlers): void {
    this.handlers.clear()
    for (const [k, v] of Object.entries(handlers)) {
      this.handlers.set(k, v)
    }
  }

  /** Set or override a single handler. */
  setHandler(methodName: string, handler: MockHandler): void {
    this.handlers.set(methodName, handler)
  }
}
