# feat(cli): Default to centy-tui on bare invocation, add cockpit command for tui-manager

## Summary

When running `pnpm dlx centy` (or just `centy`), the CLI should automatically launch the `centy-tui` binary for the interactive TUI experience.

Additionally, running `centy cockpit` should launch the `tui-manager` binary which provides a multi-pane terminal manager running two `centy-tui` instances side-by-side.

## Acceptance Criteria

1. `pnpm dlx centy` (bare invocation with no subcommand) launches `centy-tui`
2. `centy cockpit` launches `tui-manager`
3. All existing CLI commands continue to work as before

## Technical Context

- **centy-cli**: Located at `/centy-cli/`, uses oclif framework, entry point is `bin/run.js`
- **centy-tui**: Located at `/centy-tui/`, Rust binary for interactive TUI
- **tui-manager**: Located at `/tui-manager/`, Rust binary that runs 2x `centy-tui` instances with crash isolation

## Implementation Notes

- Need to modify `bin/run.js` or add a default command in oclif
- May need to detect when no command is provided and spawn `centy-tui`
- `cockpit` command should spawn `tui-manager` binary
- Binary resolution should follow similar patterns as `find-daemon-binary.ts`
