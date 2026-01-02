# Add integration tests for runtime detection wrapper

## Context

The new `bin/run` shell wrapper detects whether Bun or Node.js is available and runs the CLI accordingly, showing a tip message when falling back to Node.js.

## Test Scenarios

1. **Bun available** → uses Bun, no tip message on stderr
2. **Only Node.js available** → uses Node.js, shows "Tip: Install Bun for faster CLI performance" on stderr
3. **Windows** → `bin/run.cmd` works correctly with both runtimes

## Implementation Ideas

- Create a test that manipulates PATH to simulate Bun not being installed
- Use `child_process.spawn` or `execa` to run the wrapper
- Capture stderr to verify the tip message appears/doesn't appear
- Consider CI matrix testing with Bun/Node availability variations

## Files involved

- `bin/run` (shell wrapper)
- `bin/run.cmd` (Windows wrapper)
- New test file: `bin/run.spec.ts` or `src/lib/runtime-detection/runtime-detection.spec.ts`
