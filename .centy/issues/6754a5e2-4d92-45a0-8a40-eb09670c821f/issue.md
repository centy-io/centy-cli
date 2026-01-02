# Replace custom plist generation with plist package

Replace string concatenation plist generation with the `plist` package.

**Current implementation:**

- `src/lib/autostart/launchd.ts`
- Manual XML string building

**Suggested replacement:**

- `plist` package

**Benefits:**

- Proper XML escaping and validation
- Object-to-plist serialization
- Type-safe generation
- No manual string concatenation
- Reduces XML formatting bugs

**Effort:** Low
