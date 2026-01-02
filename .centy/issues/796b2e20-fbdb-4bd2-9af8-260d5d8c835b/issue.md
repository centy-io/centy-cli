# Add windows-latest to CI test matrix

Add `windows-latest` to the existing test matrix in .github/workflows/ci.yml to run tests on Windows alongside ubuntu-latest. This will catch Windows-specific issues like path handling, PowerShell commands, and .exe suffix handling before they reach users.
