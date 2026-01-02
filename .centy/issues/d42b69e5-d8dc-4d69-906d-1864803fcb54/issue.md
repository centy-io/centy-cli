# Use GitHub API mocking in install-daemon tests

## Problem

The `install-daemon.spec.ts` tests currently make real network calls to GitHub API, which causes flaky timeouts in CI.

**Current behavior:**

- Tests call `installDaemon({ version: '0.0.0-nonexistent' })`
- This triggers real HTTP requests to GitHub API
- In CI, this can timeout (we currently work around this with a 30s timeout)

## Proposed Solution

Replace real network calls with a mocking library to make tests faster and more reliable.

**Options:**

1. Mock `fetchRelease` / `fetchLatestRelease` functions from `github-api.ts` using vitest mocks
2. Use MSW (Mock Service Worker) to intercept HTTP requests at the network level
3. Use nock for HTTP mocking

## Benefits

- Tests become fast and deterministic
- No network dependency
- No flaky timeouts in CI
- Can test error scenarios easily

## Files involved

- `src/lib/install-daemon/install-daemon.spec.ts`
- `src/lib/install-daemon/github-api.ts`
