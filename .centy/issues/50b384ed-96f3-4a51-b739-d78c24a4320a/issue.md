# Support Node.js runtime with Bun fallback detection

## Problem

`bin/run.js` has `#!/usr/bin/env bun` shebang, but users installing via npm/pnpm likely have Node.js, not Bun. This causes the CLI to fail for users without Bun installed.

## Solution

Implement runtime detection that:

1. **Prefers Bun** when available (faster startup)
2. **Falls back to Node.js** when Bun is missing
3. **Shows a friendly message** suggesting Bun for better performance when using Node.js

## Implementation

1. Create shell wrapper `bin/run` that detects Bun vs Node.js
2. Update `bin/run.js` shebang to `#!/usr/bin/env node`
3. Update `package.json` bin entry to point to wrapper
4. Add Windows support via `bin/run.cmd`

## Behavior

| Bun installed? | What happens                                                      |
| -------------- | ----------------------------------------------------------------- |
| Yes            | Uses Bun, no message                                              |
| No             | Uses Node.js, shows "Tip: Install Bun for faster CLI performance" |

## Files to modify

- `bin/run` (new shell wrapper)
- `bin/run.cmd` (new Windows wrapper)
- `bin/run.js` (update shebang)
- `package.json` (update bin entry)
