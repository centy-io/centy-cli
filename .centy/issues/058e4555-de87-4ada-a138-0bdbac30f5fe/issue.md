# Replace custom config management with conf package

Replace custom JSON file I/O with the `conf` package for better reliability.

**Current implementation:**

- `src/tui/utils/local-config.ts`
- Manual JSON read/write with error silencing

**Suggested replacement:**

- `conf` package

**Benefits:**

- Atomic writes (prevents corruption)
- Automatic directory creation
- Schema validation with defaults
- Migration support
- Watch for file changes
- Proper permissions handling

**Effort:** Medium
