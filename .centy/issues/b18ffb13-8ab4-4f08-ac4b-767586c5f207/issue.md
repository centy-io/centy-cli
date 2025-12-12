# Add TUI support for link management

## Summary

Implement TUI (Terminal User Interface) support for managing links in the interactive centy terminal mode.

## Features to implement

1. **Link display in entity views**
   - Show existing links in issue/doc/PR detail views
   - Group links by type (blocks, relates-to, etc.)
   - Display inverse links with visual indicator

2. **Add link action**
   - Keyboard shortcut to open add link dialog
   - Entity search/selection in TUI
   - Link type selection
   - Preview of bidirectional link before creation

3. **Remove link action**
   - Navigate to link in list
   - Confirm deletion prompt
   - Show what inverse link will also be removed

## UX considerations

- Use consistent keybindings with other TUI actions
- Show link count badge on entities with links
- Support quick navigation from link to linked entity

## Notes

- Follow-up to web app link implementation (Issue #38)
- Depends on CLI commands implementation
