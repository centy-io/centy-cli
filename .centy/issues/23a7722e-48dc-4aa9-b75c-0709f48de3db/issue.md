# Replace custom tilde expansion with untildify package

Replace custom home directory expansion with `untildify` package.

**Current implementation:**

- `src/utils/resolve-project-path.ts`
- Custom `expandTilde()` function

**Suggested replacement:**

- `untildify` package

**Benefits:**

- Handles Windows/Unix path inconsistencies
- Proper environment variable expansion
- Better cross-platform reliability
- Handles edge cases (~user paths on Unix)

**Effort:** Low (drop-in replacement)
