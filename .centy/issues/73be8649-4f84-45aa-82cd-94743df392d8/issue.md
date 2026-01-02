# TUI: Hide sidebar when not in a project context

## Problem

When using the TUI without being in a project context, the sidebar still displays showing items like projects and daemon. This creates unnecessary visual clutter when the user is not actively working within a project.

## Current Behavior

- The sidebar is always visible
- When no project is selected, it shows filtered views (projects, daemon)
- Views requiring a project (issues, prs, docs, assets, config) are already hidden via getVisibleSidebarViews() in centy-cli/src/tui/types/views.ts

## Desired Behavior

- When not in a project context (selectedProjectPath is null), the sidebar should be completely hidden
- The sidebar should only appear once a project is selected
- This provides a cleaner, more focused interface when browsing/selecting projects

## Files to Modify

- centy-cli/src/tui/App.tsx - Conditionally render the Sidebar based on state.selectedProjectPath
- centy-cli/src/tui/components/layout/Sidebar.tsx - May need adjustments for the conditional rendering

## Implementation Notes

The App component already tracks selectedProjectPath in state and uses it to determine visible views. The change would involve conditionally rendering the Sidebar component itself rather than just filtering its items.
