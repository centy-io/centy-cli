/**
 * Type guard to check if an error is a gRPC ServiceError with NOT_FOUND code
 */
export function isNotFoundError(error: unknown): boolean {
  if (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    // eslint-disable-next-line no-restricted-syntax
    typeof (error as { code: unknown }).code === 'number'
  ) {
    // gRPC NOT_FOUND code is 5
    // eslint-disable-next-line no-restricted-syntax
    return (error as { code: number }).code === 5
  }
  return false
}
