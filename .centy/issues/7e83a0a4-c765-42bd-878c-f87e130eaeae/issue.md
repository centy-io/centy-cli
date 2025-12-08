# Create PRList component for TUI

Create a PR list component with sorting, filtering, and navigation capabilities.

## Acceptance Criteria

- [ ] Create tui/components/domain/PRList.tsx
- [ ] Display: display number, title, status, source/target branches, priority
- [ ] Vim-style navigation (j/k, Enter to select)
- [ ] Sorting by priority, displayNumber, createdAt, updatedAt, status
- [ ] Filter merged/closed by default with [a] toggle to show all
- [ ] [n] to navigate to create PR
- [ ] [s]/[S] to cycle sort field/direction
- [ ] Loading and empty state handling

## Reference Files

- centy-cli/src/tui/components/domain/IssueList.tsx (pattern to follow)
