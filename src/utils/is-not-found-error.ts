/**
 * Type guard to check if an error is a gRPC ServiceError with NOT_FOUND code
 */
export function isNotFoundError(error: unknown): boolean {
  if (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'number'
  ) {
    // gRPC NOT_FOUND code is 5
    return (error as { code: number }).code === 5
  }
  return false
}
