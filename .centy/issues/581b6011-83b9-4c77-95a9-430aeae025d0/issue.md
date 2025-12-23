# pnpm dlx centy fails on Windows with 'The system cannot find the path specified'

## Bug Report

When running `pnpm dlx centy` on Windows (Git Bash/MINGW64), the command fails with:

```
yonib@DESKTOP-ATPF16H MINGW64 ~
$ pnpm dlx centy
The system cannot find the path specified.
```

## Environment
- **OS:** Windows (MINGW64/Git Bash)
- **Package Manager:** pnpm (using `dlx` for execution)
- **centy version:** 0.0.30

## Root Cause Analysis
1. The `bin` entry in package.json points to `./bin/run` (without extension)
2. The package includes both `bin/run` (Unix shell) and `bin/run.cmd` (Windows batch)
3. When pnpm dlx installs the package transiently on Windows, the wrapper script resolution may fail
4. The `bin/run.cmd` file references `"%~dp0run.js"` which may not resolve correctly in the pnpm dlx context

## Potential Fixes to Investigate
1. Add `bin/run.js` as the primary bin entry (Node.js shebang works cross-platform)
2. Test with npm/npx to see if it's pnpm-specific
3. Add Windows CI/CD testing to catch these issues

## Steps to Reproduce
1. Open Git Bash (MINGW64) on Windows
2. Run `pnpm dlx centy`
3. Observe the error

## Expected Behavior
The centy CLI should launch and display the TUI interface.
