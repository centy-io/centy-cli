# Replace custom file download with got package

Replace custom fetch-based downloads with `got` for better robustness.

**Current implementation:**

- `src/lib/install-daemon/download.ts`
- Custom fetch with stream pipeline

**Suggested replacement:**

- `got` package

**Benefits:**

- Built-in progress tracking
- Automatic retries on network failure
- Timeout handling
- Response validation
- Request caching and hooks

**Effort:** Medium
