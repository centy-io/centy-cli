/**
 * Result of the init command
 */
export interface InitResult {
  /** Whether init was successful */
  success: boolean
  /** Path to .centy folder */
  centyPath: string
  /** Files that were created */
  created: string[]
  /** Files that were restored */
  restored: string[]
  /** Files that were reset */
  reset: string[]
  /** Files that were skipped */
  skipped: string[]
  /** User files left untouched */
  userFiles: string[]
}
