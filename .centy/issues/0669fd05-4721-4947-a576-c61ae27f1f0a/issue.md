# Replace custom GitHub API calls with @octokit/rest

Replace custom fetch wrapper with the official GitHub SDK.

**Current implementation:**

- `src/lib/install-daemon/github-api.ts`
- Custom fetch with headers and fallback logic

**Suggested replacement:**

- `@octokit/rest` package

**Benefits:**

- Automatic authentication support
- Rate limit handling and retry-after
- Request/response caching
- Pagination helpers
- Type-safe with TypeScript definitions
- Better error code handling

**Effort:** Medium
