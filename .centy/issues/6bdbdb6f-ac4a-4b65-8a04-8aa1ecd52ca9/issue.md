# Add CLI support for standalone workspaces (no issue required)

Add CLI commands to create and manage standalone workspaces that are not tied to an issue.

## Depends On

- centy-daemon: Support creating workspaces without an issue (standalone workspaces)

## Implementation

### Option A: New command

Add `centy workspace new` command:

```bash
centy workspace new [options]
  --name <name>        Optional workspace name
  --description <desc> Optional description/goal for the AI agent
  --ttl <hours>        Workspace TTL (default: 12)
  --agent <name>       Agent name to use
  --project <path>     Project path (defaults to current directory)
```

### Option B: Modify existing command

Make issue optional in `centy workspace open`:

```bash
centy workspace open [issueId] [options]
  # issueId becomes optional
  --standalone        Create without an issue
  --name <name>       Workspace name (for standalone)
```

## Tasks

1. Add gRPC client call to new `OpenStandaloneWorkspace` RPC
1. Implement new command or modify existing `workspace/open.ts`
1. Update help text and examples
1. Add tests for standalone workspace flow
