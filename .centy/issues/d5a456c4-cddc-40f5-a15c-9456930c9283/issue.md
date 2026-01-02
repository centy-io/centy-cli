# Validate TUI binary installation path on Windows

Test the complete TUI binary installation and launch flow on a real Windows environment. Verify:

- Binary downloads to correct path (~/.centy/bin/ -> C:\Users\<user>.centy\bin)
- .exe suffix is correctly appended
- Binary is executable without chmod
- TUI launches successfully from the CLI
- PATH environment variable handling with semicolon delimiter
