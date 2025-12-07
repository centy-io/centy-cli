# CLI TUI: Text input cannot type uppercase letters

In the CLI TUI IssueCreate component (and likely other form components like DocCreate, ProjectCreate), the text input handler at line 153 of centy-cli/src/tui/components/domain/IssueCreate.tsx uses event.name directly to append characters. However, event.name from @opentui/core KeyEvent only contains the lowercase key name (e.g., 'a' instead of 'A'), so when the user holds Shift and types a letter, it still appends the lowercase version.

## Root Cause

```typescript
} else if (event.name.length === 1 && !event.ctrl && !event.meta) {
  if (activeField === 'title') {
    setTitle(prev => prev + event.name)  // event.name is always lowercase
  }
}
```

## Fix

Check the event.shift property and convert to uppercase:

```typescript
const char = event.shift ? event.name.toUpperCase() : event.name
setTitle(prev => prev + char)
```

## Affected Files

- centy-cli/src/tui/components/domain/IssueCreate.tsx (lines 153-159)
- centy-cli/src/tui/components/domain/DocCreate.tsx (similar pattern)
- centy-cli/src/tui/components/domain/ProjectCreate.tsx (similar pattern)
