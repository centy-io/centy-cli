import { describe, expect, it, vi } from 'vitest'
import { status, Metadata } from '@grpc/grpc-js'
import type { ServiceError } from '@grpc/grpc-js'
import {
  createCallOptions,
  GrpcTimeoutError,
  isDeadlineExceededError,
  isDaemonUnavailableError,
  callWithDeadline,
  type GrpcMethod,
} from './grpc-utils.js'

function makeServiceError(code: number, message: string = ''): ServiceError {
  return Object.assign(new Error(message), { code, details: message, metadata: new Metadata() })
}

describe('grpc-utils', () => {
  describe('createCallOptions', () => {
    it('should create call options with default timeout', () => {
      const before = Date.now()
      const options = createCallOptions()
      const after = Date.now()

      expect(options.deadline).toBeInstanceOf(Date)
      const deadline = options.deadline instanceof Date ? options.deadline.getTime() : 0
      // Default timeout is 30_000ms
      expect(deadline).toBeGreaterThanOrEqual(before + 30_000)
      expect(deadline).toBeLessThanOrEqual(after + 30_000)
    })

    it('should create call options with custom timeout', () => {
      const before = Date.now()
      const options = createCallOptions(5000)
      const after = Date.now()

      const deadline = options.deadline instanceof Date ? options.deadline.getTime() : 0
      expect(deadline).toBeGreaterThanOrEqual(before + 5000)
      expect(deadline).toBeLessThanOrEqual(after + 5000)
    })
  })

  describe('GrpcTimeoutError', () => {
    it('should create error with correct message', () => {
      const error = new GrpcTimeoutError('testMethod', 5000)
      expect(error.message).toBe(
        "gRPC call 'testMethod' timed out after 5000ms. The daemon may not be responding."
      )
      expect(error.name).toBe('GrpcTimeoutError')
    })
  })

  describe('isDeadlineExceededError', () => {
    it('should return true for deadline exceeded errors', () => {
      const error = makeServiceError(status.DEADLINE_EXCEEDED)
      expect(isDeadlineExceededError(error)).toBe(true)
    })

    it('should return false for other errors', () => {
      const error = makeServiceError(status.UNAVAILABLE)
      expect(isDeadlineExceededError(error)).toBe(false)
    })
  })

  describe('isDaemonUnavailableError', () => {
    it('should return true for unavailable status', () => {
      const error = makeServiceError(status.UNAVAILABLE, 'some error')
      expect(isDaemonUnavailableError(error)).toBe(true)
    })

    it('should return true for ECONNREFUSED message', () => {
      const error = makeServiceError(status.UNKNOWN, 'connect ECONNREFUSED 127.0.0.1:50051')
      expect(isDaemonUnavailableError(error)).toBe(true)
    })
  })

  describe('callWithDeadline', () => {
    it('should resolve with response on success', async () => {
      const mockMethod: GrpcMethod<unknown, string> = vi.fn(
        (
          _req: unknown,
          _opts: unknown,
          cb: (err: null, res: string) => void
        ) => {
          cb(null, 'response')
        }
      )

      const result = await callWithDeadline(
        mockMethod,
        { test: true },
        5000
      )
      expect(result).toBe('response')
    })

    it('should reject with error on failure', async () => {
      const mockError = makeServiceError(status.UNKNOWN, 'test error')
      const mockMethod: GrpcMethod<unknown, null> = vi.fn(
        (
          _req: unknown,
          _opts: unknown,
          cb: (err: ServiceError, res: null) => void
        ) => {
          cb(mockError, null)
        }
      )

      await expect(
        callWithDeadline(mockMethod, { test: true }, 5000)
      ).rejects.toThrow('test error')
    })
  })
})
