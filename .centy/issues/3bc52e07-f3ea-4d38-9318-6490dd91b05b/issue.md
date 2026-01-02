# Add CLI commands for move/duplicate issues and docs

## Summary

Implement CLI commands to move and duplicate issues and docs between centy projects.

## Background

The daemon now supports these operations via gRPC:

- `MoveIssue` - Transfer issue to another project (deletes from source, preserves UUID)
- `DuplicateIssue` - Copy issue to same/different project (new UUID)
- `MoveDoc` - Transfer doc to another project (deletes from source)
- `DuplicateDoc` - Copy doc to same/different project (new slug)

Related: centy-daemon Issue #43

## Commands to implement

### Issue commands

```bash
# Move issue to another project
centy move issue <issue-id> --to <target-project>

# Duplicate issue (same project)
centy duplicate issue <issue-id>

# Duplicate issue to another project
centy duplicate issue <issue-id> --to <target-project>

# Optional flags
--title "Custom title"  # Override title for duplicate
```

### Doc commands

```bash
# Move doc to another project
centy move doc <slug> --to <target-project>

# Duplicate doc (same project)
centy duplicate doc <slug>

# Duplicate doc to another project
centy duplicate doc <slug> --to <target-project>

# Optional flags
--title "Custom title"  # Override title for duplicate
--slug "new-slug"       # Override slug for duplicate
```

## Implementation details

### File structure

- `src/commands/move/issue.ts` - Move issue command
- `src/commands/move/doc.ts` - Move doc command
- `src/commands/duplicate/issue.ts` - Duplicate issue command
- `src/commands/duplicate/doc.ts` - Duplicate doc command

### Project resolution

- `--to` flag accepts project name (resolved via daemon's project registry)
- If not specified for duplicate, duplicates within current project

### Output

- On success: Display moved/duplicated item details (title, new display number/slug, target project)
- On failure: Show error message

### Tests

- Unit tests for each command
- Integration tests with daemon
