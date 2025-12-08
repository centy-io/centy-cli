/**
 * View/route definitions for the TUI
 */

export type ViewId =
  | 'projects'
  | 'project-create'
  | 'issues'
  | 'issue-detail'
  | 'issue-create'
  | 'issue-edit'
  | 'prs'
  | 'pr-detail'
  | 'pr-create'
  | 'pr-edit'
  | 'docs'
  | 'doc-detail'
  | 'doc-create'
  | 'assets'
  | 'config'
  | 'daemon'
  | 'help'

export interface ViewParams {
  issueId?: string
  prId?: string
  docSlug?: string
}

export const VIEW_LABELS: Record<ViewId, string> = {
  projects: 'Projects',
  'project-create': 'Add Project',
  issues: 'Issues',
  'issue-detail': 'Issue Detail',
  'issue-create': 'New Issue',
  'issue-edit': 'Edit Issue',
  prs: 'Pull Requests',
  'pr-detail': 'PR Detail',
  'pr-create': 'New PR',
  'pr-edit': 'Edit PR',
  docs: 'Docs',
  'doc-detail': 'Doc Detail',
  'doc-create': 'New Doc',
  assets: 'Assets',
  config: 'Config',
  daemon: 'Daemon',
  help: 'Help',
}

export const SIDEBAR_VIEWS: ViewId[] = [
  'projects',
  'issues',
  'prs',
  'docs',
  'assets',
  'config',
  'daemon',
]

/** Views that require a project to be selected */
export const PROJECT_REQUIRED_VIEWS: Set<ViewId> = new Set([
  'issues',
  'prs',
  'docs',
  'assets',
  'config',
])

/** Get visible sidebar views based on project selection */
export function getVisibleSidebarViews(hasProjectSelected: boolean): ViewId[] {
  if (hasProjectSelected) {
    return SIDEBAR_VIEWS
  }
  return SIDEBAR_VIEWS.filter(view => !PROJECT_REQUIRED_VIEWS.has(view))
}
