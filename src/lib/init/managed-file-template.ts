/**
 * Definition of a managed file template
 */
export interface ManagedFileTemplate {
  /** Type of the managed item */
  type: 'file' | 'directory'
  /** Content for files (undefined for directories) */
  content?: string
}
