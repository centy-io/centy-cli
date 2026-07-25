/**
 * Initialization check utilities
 * Multiple exports allowed for related error class and function
 */
export {
  assertInitialized as ensureInitialized,
  NotInitializedError,
} from '../lib/assert/index.js'
