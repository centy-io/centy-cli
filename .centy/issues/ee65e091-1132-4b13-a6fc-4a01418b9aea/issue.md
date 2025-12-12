# Show actionable error in TUI when AI agent is not configured

When user attempts to spawn an agent from TUI and no agent is configured, show actionable error in the status bar or modal with ability to configure.

## Requirements:

- Show error in status bar (red text) when agent spawn fails
- Provide keyboard shortcut or menu option to open agent configuration
- Consider adding agent configuration panel to TUI settings
- Follow existing TUI error patterns:
  - Status bar for transient errors
  - Global state via SET_ERROR action
  - Confirmation flow pattern for configuration

## Technical context:

- TUI state management in /centy-cli/src/tui/state/app-state.tsx
- Status bar in /centy-cli/src/tui/components/layout/StatusBar.tsx
- Could add new panel for agent configuration

## Files to reference:

- centy-cli/src/tui/state/app-state.tsx
- centy-cli/src/tui/components/layout/StatusBar.tsx
- centy-cli/src/tui/hooks/useDaemonActions.ts (action pattern)
