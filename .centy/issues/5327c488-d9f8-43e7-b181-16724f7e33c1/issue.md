# Replace custom UUID validation with uuid package

Replace the custom regex-based UUID validation in `src/utils/is-valid-uuid.ts` with the `uuid` package's `validate()` function.

**Current implementation:**

- Custom regex pattern in `is-valid-uuid.ts`

**Suggested replacement:**

- `uuid` package with `uuid.validate()`

**Benefits:**

- RFC 4122 compliant validation
- Handles different UUID versions (v1, v3, v4, v5)
- Battle-tested across millions of projects

**Effort:** Low (drop-in replacement)
