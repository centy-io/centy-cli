# Add platform skip helpers for Windows-incompatible tests

Create test utility helpers to conditionally skip tests that cannot run on Windows. Use `skipIf(process.platform === 'win32')` or similar patterns for tests that rely on Unix-specific behavior (e.g., chmod, Unix signals, symlinks). This ensures the test suite can run cleanly on Windows without false failures.
