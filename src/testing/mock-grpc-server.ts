/**
 * Mock gRPC server for E2E testing.
 * Creates a real gRPC server loaded from the centy proto file,
 * allowing tests to configure per-method response handlers.
 */
import * as grpc from '@grpc/grpc-js'
import type { ServiceClientConstructor } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
  private server: grpc.Server
  private port = 0
  private handlers: Map<string, MockHandler>
  private serviceSetup = false

  constructor(handlers: MockHandlers = {}) {
    this.server = new grpc.Server()
    this.handlers = new Map(Object.entries(handlers))
    this.setupService()
  }

  private setupService(): void {
    if (this.serviceSetup) return
    this.serviceSetup = true

    const packageDef = loadSync(PROTO_PATH, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [PROTO_INCLUDE_DIR],
    })

    const protoDesc = grpc.loadPackageDefinition(packageDef) as Record<
      string,
      unknown
    >
    const centyNs = protoDesc['centy'] as Record<string, unknown>
    const v1Ns = centyNs['v1'] as Record<string, unknown>
    const ServiceCtor = v1Ns['CentyDaemon'] as ServiceClientConstructor
    const service = ServiceCtor.service

    const implementations: grpc.UntypedServiceImplementation = {}

    for (const methodName of Object.keys(service)) {
      const camelName =
        methodName.charAt(0).toLowerCase() + methodName.slice(1)
      const handlerRef = this.handlers

      implementations[camelName] = (
        call: grpc.ServerUnaryCall<unknown, unknown>,
        callback: grpc.sendUnaryData<unknown>
      ) => {
        const handler = handlerRef.get(camelName)
        if (handler !== undefined) {
          Promise.resolve(handler(call.request))
            .then(response => callback(null, response))
            .catch((err: Error) => {
              callback({
                code: grpc.status.INTERNAL,
                message: err.message,
              } as grpc.ServiceError)
            })
        } else {
          callback({
            code: grpc.status.UNIMPLEMENTED,
            message: `Method ${camelName} not registered in mock server`,
          } as grpc.ServiceError)
        }
      }
    }

    this.server.addService(service, implementations)
  }

  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        '127.0.0.1:0',
        grpc.ServerCredentials.createInsecure(),
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
