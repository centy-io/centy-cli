function hasNumericCode(error: object): error is { code: number } {
  if (!('code' in error)) {
    return false
  }
  const code = Reflect.get(error, 'code')
  return typeof code === 'number'
}

/**
 * Type guard to check if an error is a gRPC ServiceError with NOT_FOUND code
 */
export function isNotFoundError(error: unknown): boolean {
  if (error === null || typeof error !== 'object') {
    return false
  }
  if (!hasNumericCode(error)) {
    return false
  }
  // gRPC NOT_FOUND code is 5
  return error.code === 5
}
