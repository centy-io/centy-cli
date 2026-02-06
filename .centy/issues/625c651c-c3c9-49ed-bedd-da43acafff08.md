---
displayNumber: 7
status: open
priority: 2
createdAt: 2025-12-05T14:32:39.043973+00:00
updatedAt: 2025-12-05T14:32:39.043973+00:00
---

# Improve error message when daemon binary is missing

## Problem

When running `centy start` without the daemon binary installed, the error message is confusing and unhelpful:

```
error: Could not find centy-daemon binary at: centy-daemon. Make sure the daemon is built and accessible.
       code: undefined,
      oclif: { exit: 2 },
      ...
 ›   Error: Daemon process started but is not responding. Check daemon logs for errors.
```

Issues:

1. Shows raw error object properties (`code: undefined`, `oclif: { exit: 2 }`)
1. Shows stack trace that’s not useful to end users
1. Contradictory message: “Daemon process started but is not responding” when it actually failed to start
1. No actionable guidance on how to fix the issue

## Solution

Provide a clean, actionable error message when the daemon binary is missing:

```
Error: Daemon binary not found

The centy-daemon binary could not be found at: centy-daemon

To fix this:
  1. Install the daemon: centy install daemon
  2. Start the daemon: centy start
  3. Verify installation: centy info

Or set CENTY_DAEMON_PATH environment variable to the binary location.
```

## Implementation

**File:** `centy-cli/src/commands/start.ts`

1. Fix the `handleSpawnError` method (line 89-97):
   - Add `return` after `this.error()` calls to prevent fall-through
   - Handle different error codes (ENOENT, EACCES) with specific messages

1. Provide actionable suggestions based on error type:
   - ENOENT: Install instructions
   - EACCES: Permission fix instructions
   - Other: Generic message with debugging hints

1. Optionally list the paths that were searched (from `findDaemonBinary.ts`):
   - `CENTY_DAEMON_PATH` env var
   - `~/.centy/bin/centy-daemon`
   - Same directory as CLI binary
   - Dev path: `../../../centy-daemon/target/release/`
   - PATH lookup: `centy-daemon`

## Acceptance Criteria

- [ ] Clean error message without stack traces or raw object dumps
- [ ] Actionable “To fix this” section with numbered steps
- [ ] Different messages for different error types (not found vs permission denied)
- [ ] Optional: Show searched paths when in verbose/debug mode
