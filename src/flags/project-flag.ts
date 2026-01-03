import { Flags } from '@oclif/core'

/**
 * Shared --project flag for entity commands.
 * Accepts either a project name (e.g., "centy-daemon") or a filesystem path.
 */
export const projectFlag = Flags.string({
  description: 'Project name or path (defaults to current directory)',
})
