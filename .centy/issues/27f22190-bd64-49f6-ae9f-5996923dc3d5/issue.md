# Replace custom retry logic with async-retry package

Replace basic retry loop with `async-retry` for more robust retry handling.

**Current implementation:**

- `src/lib/start/wait-for-daemon.ts`
- Simple for-loop with fixed delay

**Suggested replacement:**

- `async-retry` package

**Benefits:**

- Exponential backoff algorithms
- Jitter support to prevent thundering herd
- Custom retry conditions
- Timeout management
- Production-ready reliability patterns

**Effort:** Low
