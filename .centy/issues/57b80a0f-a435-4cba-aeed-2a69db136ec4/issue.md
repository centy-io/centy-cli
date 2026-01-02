# Replace custom prompts with prompts package

Replace custom readline-based prompts with the `prompts` package for better UX.

**Current implementation:**

- `src/utils/ask-yes-no.ts`
- `src/utils/ask-yes-no-all-none.ts`
- `src/utils/create-prompt-interface.ts`
- `src/utils/close-prompt-interface.ts`
- `src/lib/create-issue/prompt-for-priority.ts`

**Suggested replacement:**

- `prompts` package

**Benefits:**

- Arrow key navigation for selections
- Built-in input validation
- Better handling of piped input and CI environments
- Cross-platform reliability
- Removes custom readline management code

**Effort:** Medium
