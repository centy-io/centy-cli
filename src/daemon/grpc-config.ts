/* eslint-disable single-export/single-export */
import type { ChannelOptions } from '@grpc/grpc-js'

/**
 * Default timeout for gRPC calls in milliseconds (30 seconds)
 */
export const DEFAULT_GRPC_TIMEOUT_MS = 30_000

/**
 * Timeout for long-running operations like init/compact (2 minutes)
 */
export const LONG_GRPC_TIMEOUT_MS = 120_000

/**
 * Channel options for gRPC connection management
 */
export const CHANNEL_OPTIONS: ChannelOptions = {
  // Initial connection timeout (10 seconds)
  'grpc.initial_reconnect_backoff_ms': 1000,
  'grpc.max_reconnect_backoff_ms': 10000,
  // Keepalive settings
  'grpc.keepalive_time_ms': 30000,
  'grpc.keepalive_timeout_ms': 10000,
  'grpc.keepalive_permit_without_calls': 1,
  // Connection management
  'grpc.max_connection_idle_ms': 60000,
  'grpc.max_connection_age_ms': 300000,
  // Enable HTTP/2 true binary
  'grpc.http2.true_binary': 1,
}
