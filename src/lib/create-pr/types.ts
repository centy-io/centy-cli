type Priority = 'low' | 'medium' | 'high'
type Status = 'draft' | 'open'

export interface GatherPrInputResult {
  title: string | null
  description: string
  sourceBranch: string
  targetBranch: string
  linkedIssues: string[]
  reviewers: string[]
  priority: Priority
  status: Status
}
