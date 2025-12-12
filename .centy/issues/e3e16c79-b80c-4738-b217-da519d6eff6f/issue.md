# Show actionable error in CLI when AI agent is not configured

When user runs agent-related CLI commands and no agent is configured, show helpful error with configuration guidance.

## Requirements:

- Detect missing agent configuration in CLI commands
- Show clear error message with:
  - What's wrong: 'No default AI agent configured'
  - How to fix: Instructions to configure via config file or TUI
  - Example configuration snippet
- Use oclif this.error() pattern with helpful message
- Consider adding 'centy config agent' command for quick setup

## Technical context:

- CLI uses daemon-service.ts for daemon communication
- Custom error classes in /centy-cli/src/lib/install-daemon/errors.ts
- Could add AgentNotConfiguredError custom error class

## Files to reference:

- centy-cli/src/tui/services/daemon-service.ts
- centy-cli/src/lib/install-daemon/errors.ts
- centy-cli/src/hooks/prerun.ts (pre-run hook pattern)
