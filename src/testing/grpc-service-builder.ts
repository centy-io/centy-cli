/**
 * Helpers for building a gRPC service implementation from mock handlers.
 * Extracted to keep mock-grpc-server.ts within line-count limits.
 */
import type {
  ServerUnaryCall,
  ServiceClientConstructor,
  ServiceDefinition,
  UntypedServiceImplementation,
  sendUnaryData,
  ServiceError,
} from '@grpc/grpc-js'
import { loadPackageDefinition } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import type { MockHandler } from './mock-grpc-server.js'

interface GrpcStatus {
  INTERNAL: number
  UNIMPLEMENTED: number
}

/** Loads the CentyDaemon service definition from the given proto file. */
export function loadCentyService(
  protoPath: string,
  includeDir: string
): ServiceDefinition {
  const packageDef = loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [includeDir],
  })
  const protoDesc = loadPackageDefinition(packageDef) as Record<string, unknown>
  const centyNs = protoDesc['centy'] as Record<string, unknown>
  const v1Ns = centyNs['v1'] as Record<string, unknown>
  const ServiceCtor = v1Ns['CentyDaemon'] as ServiceClientConstructor
  return ServiceCtor.service
}

/**
 * Builds a service implementation object for each method defined in the
 * service definition, delegating to the provided handler map at call time.
 */
export function buildServiceImplementation(
  service: ServiceDefinition,
  handlers: Map<string, MockHandler>,
  grpcStatus: GrpcStatus
): UntypedServiceImplementation {
  const entries = Object.keys(service).map(methodName => {
    const camelName = methodName.charAt(0).toLowerCase() + methodName.slice(1)
    const impl = (
      call: ServerUnaryCall<unknown, unknown>,
      callback: sendUnaryData<unknown>
    ) => {
      const handler = handlers.get(camelName)
      if (handler !== undefined) {
        Promise.resolve(handler(call.request))
          .then(response => callback(null, response))
          .catch((err: Error) => {
            callback({
              code: grpcStatus.INTERNAL,
              message: err.message,
            } as ServiceError)
          })
      } else {
        callback({
          code: grpcStatus.UNIMPLEMENTED,
          message: `Method ${camelName} not registered in mock server`,
        } as ServiceError)
      }
    }
    return [camelName, impl] as const
  })
  return Object.fromEntries(entries) as UntypedServiceImplementation
}
