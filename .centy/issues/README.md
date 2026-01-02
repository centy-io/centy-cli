# Issues

This folder contains project issues managed by [Centy](https://github.com/tupe12334/centy-cli).

## LLM Instructions

If you are an AI/LLM assistant, read this section carefully.

### Issue Structure

Each issue is stored in its own folder (UUID or display number) with:

- `issue.md` - The issue content (title and description in markdown)
- `metadata.json` - Machine-readable metadata:
  - `displayNumber` - Human-friendly issue number
  - `status` - Current status (e.g., "open", "in-progress", "closed")
  - `priority` - Priority level (1 = highest)
  - `createdAt` / `updatedAt` - ISO 8601 timestamps

### Working with Issues

1. **Reading Issues**: You can freely read `issue.md` and `metadata.json` files to understand the project's issues.

2. **Modifying Issues**: Check `config.json` in the parent `.centy/` folder for the `llm` configuration section:
   - `llm.autoCloseOnComplete`: If `true`, you should update the issue status to "closed" after completing the work
   - `llm.updateStatusOnStart`: If `true`, you should update status to "in-progress" when starting work
   - `llm.allowDirectEdits`: If `true`, you may directly edit `metadata.json` to change status. If `false`, use the `centy` CLI instead

3. **Status Values**: Valid status values are defined in `config.json` under `allowedStates`. Default: `["open", "in-progress", "closed"]`

### Best Practices

- Always read the full issue content before starting work
- Check the priority to understand urgency (1 = highest priority)
- Update status according to the project's `llm` configuration
- When closing an issue, update the `updatedAt` timestamp to the current ISO 8601 time
