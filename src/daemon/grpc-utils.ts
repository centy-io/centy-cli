/* eslint-disable single-export/single-export */
/* eslint-disable default/no-default-params */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { status } from '@grpc/grpc-js'
import type { ServiceError, CallOptions } from '@grpc/grpc-js'
import { DEFAULT_GRPC_TIMEOUT_MS } from './grpc-config.js'

/**
 * gRPC method type that supports options
 */
export type GrpcMethod<Req, Res> = {
  (
    request: Req,
    callback: (error: ServiceError | null, response: Res) => void
  ): void
  (
    request: Req,
    options: CallOptions,
    callback: (error: ServiceError | null, response: Res) => void
  ): void
}

/**
 * Create call options with a deadline
 */
export function createCallOptions(
  timeoutMs: number = DEFAULT_GRPC_TIMEOUT_MS
): CallOptions {
  return {
    deadline: new Date(Date.now() + timeoutMs),
  }
}

/**
 * Error class for gRPC deadline exceeded
 */
export class GrpcTimeoutError extends Error {
  constructor(methodName: string, timeoutMs: number) {
    super(
      `gRPC call '${methodName}' timed out after ${timeoutMs}ms. The daemon may not be responding.`
    )
    this.name = 'GrpcTimeoutError'
  }
}

/**
 * Check if an error is a deadline exceeded error
 */
export function isDeadlineExceededError(error: ServiceError): boolean {
  return error.code === status.DEADLINE_EXCEEDED
}

/**
 * Check if an error indicates the daemon is unavailable
 */
export function isDaemonUnavailableError(error: ServiceError): boolean {
  return (
    error.code === status.UNAVAILABLE ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('UNAVAILABLE')
  )
}

/**
 * Generic wrapper for gRPC calls with deadline support
 * This ensures all calls have a timeout and won't hang forever
 */
export function callWithDeadline<Req, Res>(
  method: GrpcMethod<Req, Res>,
  request: Req,
  timeoutMs: number = DEFAULT_GRPC_TIMEOUT_MS
): Promise<Res> {
  return new Promise((resolve, reject) => {
    const options = createCallOptions(timeoutMs)
    method(request, options, (error: ServiceError | null, response: Res) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
