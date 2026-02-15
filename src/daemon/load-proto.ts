/* eslint-disable single-export/single-export */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPackageDefinition, credentials } from '@grpc/grpc-js'
import type { ChannelOptions } from '@grpc/grpc-js'
import { loadSync } from '@grpc/proto-loader'
import type { CentyDaemonDataClient } from './grpc-client-data.js'
import type { CentyDaemonExtendedClient } from './grpc-client-extended.js'
import type { CentyDaemonInitClient } from './grpc-client-init.js'
import type { CentyDaemonItemsClient } from './grpc-client-items.js'
import type { CentyDaemonOpsClient } from './grpc-client-ops.js'
import type { CentyDaemonProjectClient } from './grpc-client-project.js'
import { CHANNEL_OPTIONS } from './grpc-config.js'

export { DEFAULT_GRPC_TIMEOUT_MS, LONG_GRPC_TIMEOUT_MS } from './grpc-config.js'
export {
  createCallOptions,
  GrpcTimeoutError,
  isDeadlineExceededError,
  isDaemonUnavailableError,
  callWithDeadline,
} from './grpc-utils.js'
export type { GrpcMethod } from './grpc-utils.js'

interface CentyDaemonClient
  extends
    CentyDaemonInitClient,
    CentyDaemonDataClient,
    CentyDaemonProjectClient,
    CentyDaemonOpsClient,
    CentyDaemonExtendedClient,
    CentyDaemonItemsClient {}

interface ProtoDescriptor {
  centy: {
    v1: {
      CentyDaemon: new (
        address: string,
        creds: ReturnType<typeof credentials.createInsecure>,
        options?: ChannelOptions
      ) => CentyDaemonClient
    }
  }
}

const currentDir = dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = join(currentDir, '../../proto/centy/v1/centy.proto')
const PROTO_INCLUDE_DIR = join(currentDir, '../../proto')
const DEFAULT_DAEMON_ADDRESS = '127.0.0.1:50051'

let clientInstance: CentyDaemonClient | null = null

function getAddress(): string {
  // eslint-disable-next-line no-restricted-syntax
  const envAddr = process.env['CENTY_DAEMON_ADDR']
  if (envAddr !== undefined && envAddr !== '') {
    return envAddr
  }
  return DEFAULT_DAEMON_ADDRESS
}

/**
 * Reset the client instance (useful for testing or reconnection)
 */
export function resetDaemonClient(): void {
  clientInstance = null
}

/**
 * Load proto and create daemon client with channel options for connection management.
 * The client uses keepalive and reconnection settings to handle network issues.
 */
export function getDaemonClient(): CentyDaemonClient {
  if (clientInstance !== null) {
    return clientInstance
  }

  const packageDefinition = loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [PROTO_INCLUDE_DIR],
  })

  // eslint-disable-next-line no-restricted-syntax
  const protoDescriptor = loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoDescriptor

  const address = getAddress()
  clientInstance = new protoDescriptor.centy.v1.CentyDaemon(
    address,
    credentials.createInsecure(),
    CHANNEL_OPTIONS
  )

  return clientInstance
}
