# TUI: Arrow up/down navigation doesn't match visual list order

## Problem

When navigating lists in the TUI using arrow up/down keys, the selection movement doesn't match the visual list order.

## Expected Behavior

- Arrow down should move selection to the next item below in the visual list
- Arrow up should move selection to the previous item above in the visual list

## Actual Behavior

Arrow navigation doesn't correspond to the visual list order (needs more specific reproduction details).

## Technical Analysis

Reviewed the list components and found they all use the same pattern:

```typescript
// In IssueList.tsx, PRList.tsx, DocList.tsx, ProjectList.tsx
if (event.name === 'j' || event.name === 'down') {
  setSelectedIndex(prev => Math.min(prev + 1, items.length - 1))
} else if (event.name === 'k' || event.name === 'up') {
  setSelectedIndex(prev => Math.max(prev - 1, 0))
}
```

The logic appears correct (down increases index, up decreases index). Potential causes:

1. **@opentui/react useKeyboard hook** - May have issues mapping arrow key events
2. **State synchronization** - selectedIndex state updates may not sync properly with render
3. **Scrollbox behavior** - Scrolling may create visual mismatch with actual selection
4. **Terminal-specific issues** - Arrow key handling may vary by terminal

## Affected Components

- `centy-cli/src/tui/components/domain/IssueList.tsx`
- `centy-cli/src/tui/components/domain/PRList.tsx`
- `centy-cli/src/tui/components/domain/DocList.tsx`
- `centy-cli/src/tui/components/domain/ProjectList.tsx`
- `centy-cli/src/tui/components/layout/Sidebar.tsx`

## Steps to Reproduce

1. Run `centy` TUI
2. Navigate to any list view (Issues, PRs, Docs, Projects)
3. Use arrow up/down keys to navigate
4. Observe selection movement vs visual list order

## Environment

- OS: macOS
- Terminal: (needs specification)
