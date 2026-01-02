# Add platform-specific integration tests for binary installation

Create integration tests that verify the binary installation flow works correctly on each platform. Key areas to test:

- PowerShell Expand-Archive extraction on Windows
- tar/unzip extraction on Unix
- .exe suffix handling on Windows
- chmod permission setting on Unix (skipped on Windows)
- Correct binary path resolution for each platform
