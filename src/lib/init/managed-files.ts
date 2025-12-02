import type { ManagedFileTemplate } from './managed-file-template.js'
import { README_CONTENT } from './readme-content.js'

/**
 * All managed files and directories created by centy init
 */
export const MANAGED_FILES: Record<string, ManagedFileTemplate> = {
  'issues/': { type: 'directory' },
  'docs/': { type: 'directory' },
  'README.md': { type: 'file', content: README_CONTENT },
}
