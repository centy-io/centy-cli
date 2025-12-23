# Run CI tasks in parallel for faster builds

Currently, the test CI job runs lint, format:check, spell, knip, test:coverage, and build sequentially. These tasks are independent and could run in parallel as separate jobs to reduce overall CI time.
