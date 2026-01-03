/**
 * Result of the create-issue operation
 */
export interface CreateIssueResult {
  /** Whether creation was successful */
  success: boolean
  /** Issue number (e.g., "0001") */
  issueNumber?: string
  /** Path to issue folder */
  issuePath?: string
  /** Path to issue.md */
  issueMarkdownPath?: string
  /** Path to metadata.json */
  metadataPath?: string
  /** Error message if failed */
  error?: string
}
