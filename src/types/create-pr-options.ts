/**
 * Options for the create-pr command
 */
export interface CreatePrOptions {
  /** Working directory (defaults to process.cwd()) */
  cwd?: string
  /** PR title */
  title?: string
  /** PR description */
  description?: string
  /** Source branch (auto-detected if not provided) */
  sourceBranch?: string
  /** Target branch (defaults to main) */
  targetBranch?: string
  /** Linked issue IDs */
  linkedIssues?: string[]
  /** Reviewers */
  reviewers?: string[]
  /** Priority level */
  priority?: 'low' | 'medium' | 'high'
  /** Initial status */
  status?: 'draft' | 'open'
  /** Custom field values */
  customFields?: Record<string, unknown>
  /** Input stream for prompts (defaults to process.stdin) */
  input?: NodeJS.ReadableStream
  /** Output stream for messages (defaults to process.stdout) */
  output?: NodeJS.WritableStream
}
