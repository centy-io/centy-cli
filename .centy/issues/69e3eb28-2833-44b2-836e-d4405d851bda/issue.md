# Add archive and remove project options to TUI

## Summary

Add the ability to archive and remove (untrack) projects directly from the TUI interface.

## Current State

- TUI ProjectList only supports: navigate (j/k), select (Enter), favorite (f)
- No way to archive or remove projects from within the TUI
- CLI has `centy untrack project` command but it's not exposed in TUI
- No archive functionality exists anywhere

## Requested Features

### 1. Archive Projects

Allow users to archive projects to hide them from the main list while keeping their data.

- Add `isArchived` field to ProjectInfo
- Add daemon RPC for SetProjectArchived
- Add CLI command `centy project archive [path]`
- TUI: Press `a` to toggle archive on selected project
- Archived projects hidden by default, with option to show them

### 2. Remove/Untrack Projects in TUI

Expose the existing untrack functionality in the TUI.

- TUI: Press `x` to untrack selected project
- Show confirmation dialog before removing
- Calls existing `UntrackProject` daemon RPC

## Suggested Keyboard Shortcuts

- `a` - Toggle archive status
- `x` - Remove/untrack project (with confirmation)
