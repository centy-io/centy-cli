# Fix flaky GitHub API tests hitting rate limits in CI

## Problem

The tests in `src/lib/install-daemon/github-api.spec.ts` are flaky because they make real HTTP calls to the GitHub API without authentication. In CI, this results in 403 rate limit errors:

```
GithubApiError: "Failed to fetch release v0.0.0-nonexistent: 403 rate limit exceeded"
```

### Failing Tests

- `should throw ReleaseNotFoundError for non-existent version`
- `should handle version with or without v prefix`

Both tests expect `ReleaseNotFoundError` but receive `GithubApiError` when rate limited.

## Solution

**Mock the GitHub API calls**

- Use vitest mocking to stub `fetch` calls
- Test error handling logic without real network calls
- Most reliable for CI environments

## Affected File

- `src/lib/install-daemon/github-api.spec.ts`

## CI Run with Failure

- https://github.com/centy-io/centy-cli/actions/runs/20128378233
