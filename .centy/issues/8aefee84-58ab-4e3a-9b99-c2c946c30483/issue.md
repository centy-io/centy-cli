# Create PRCreate and PREdit components for TUI

Create PR creation and editing forms for the TUI.

## Acceptance Criteria

- [ ] Create tui/components/domain/PRCreate.tsx:
  - Form fields: title, description, source branch, target branch, priority, status
  - Optional: linked issues, reviewers (multi-select or comma-separated)
  - Tab navigation between fields
  - ^S to save, Esc to cancel
  - Auto-detect current git branch for source
  - Default target branch to 'main'
- [ ] Create tui/components/domain/PREdit.tsx:
  - Pre-populate fields with current PR data
  - Same form layout as PRCreate
  - Show PR display number in header
- [ ] Add PR-related keyboard shortcuts to App.tsx viewShortcuts
- [ ] Update App.tsx renderView to include new PR views

## Reference Files

- centy-cli/src/tui/components/domain/IssueCreate.tsx
- centy-cli/src/tui/components/domain/IssueEdit.tsx
- centy-cli/src/tui/App.tsx (lines 174-227 for renderView)
