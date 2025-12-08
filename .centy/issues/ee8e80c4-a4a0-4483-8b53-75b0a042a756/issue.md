# Add PR state management, types, and hooks to TUI

Add PR-related state to app-state.tsx, define PR view types, and create usePullRequests hook.

## Acceptance Criteria

- [ ] Update tui/types/views.ts:
  - Add PR view IDs: 'prs', 'pr-detail', 'pr-create', 'pr-edit'
  - Add to ViewParams: prId?: string
  - Add to VIEW_LABELS, SIDEBAR_VIEWS, PROJECT_REQUIRED_VIEWS
- [ ] Update tui/state/app-state.tsx:
  - Import PullRequest type from daemon types
  - Add prs: PullRequest[] to AppState
  - Add selectedPrId: string | null to AppState
  - Add optional prSort: PrSortConfig (similar to issueSort)
  - Add actions: SET_PRS, SELECT_PR, SET_PR_SORT
  - Update reducer to handle new actions
- [ ] Create tui/hooks/usePullRequests.ts:
  - Similar structure to useIssues.ts
  - Add loadPrs, selectPr functions
  - Load PRs when project is selected
- [ ] Update tui/services/daemon-service.ts:
  - Add listPrs, getPr, createPr, updatePr methods
  - Import daemon PR functions

## Reference Files

- centy-cli/src/tui/state/app-state.tsx
- centy-cli/src/tui/types/views.ts
- centy-cli/src/tui/hooks/useIssues.ts
- centy-cli/src/tui/services/daemon-service.ts
