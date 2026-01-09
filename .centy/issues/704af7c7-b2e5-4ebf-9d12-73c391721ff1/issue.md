# EBADMACHO error when launching TUI on macOS

## Description

When running `pnpm dlx centy`, the TUI fails to launch with an EBADMACHO error.

## Error Message

```
Failed to launch TUI: EBADMACHO: unknown error, posix_spawn '/Users/ofek/.centy/bin/centy-tui'
```

## Environment

- Platform: macOS (Darwin 24.4.0)
- Architecture: Likely ARM64 (Apple Silicon)

## Possible Causes

1. The downloaded binary is for the wrong architecture (e.g., x86_64 binary on ARM Mac)
1. The binary is corrupted during download
1. The binary is not a valid Mach-O executable

## Steps to Reproduce

1. Run `pnpm dlx centy`
1. Observe the EBADMACHO error

## Suggested Fix

- Verify the correct architecture binary is being downloaded for the user’s system
- Add architecture detection before downloading the TUI binary
- Consider adding a fallback or clearer error message when architecture mismatch is detected
