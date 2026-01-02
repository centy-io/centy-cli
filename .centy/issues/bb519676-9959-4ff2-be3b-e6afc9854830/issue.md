# Replace custom checksum verification with hasha package

Replace custom SHA256 stream handling with the `hasha` package.

**Current implementation:**

- `src/lib/install-daemon/checksum.ts`
- Custom stream-based hash calculation

**Suggested replacement:**

- `hasha` package

**Benefits:**

- Simpler async/await API
- Multiple hash algorithms supported
- Better error handling
- Less boilerplate code

**Effort:** Low
