# Centy CLI

CLI for managing project issues and docs via code in the `.centy` folder. Local-first, git-friendly issue and documentation tracking.

## Installation

```bash
# Using pnpm (recommended)
pnpm add -g centy

# Or run directly without installing
pnpm dlx centy
```

### Install the Daemon

The CLI requires the centy daemon to be running. Install it with:

```bash
# Install latest version
centy install daemon

# Install specific version
centy install daemon --version 0.1.0

# Force reinstall
centy install daemon --force
```

## Quick Start

```bash
# Install the daemon (first time only)
centy install daemon

# Start the daemon
centy start

# Initialize centy in your project
centy init

# Create an issue
centy create issue --title "Fix login bug" --priority high

# List issues
centy list issues
```

## Commands

### Project Management

```bash
# Initialize a .centy folder
centy init

# Initialize with defaults (skip prompts)
centy init --force

# Register a project for tracking
centy register project

# Remove a project from tracking
centy untrack project
```

### Issues

```bash
# Create an issue (interactive prompts for missing fields)
centy create issue

# Create an issue with all options
centy create issue --title "Bug fix" --description "Fix the bug" --priority high --status open

# Short flags
centy create issue -t "Bug fix" -d "Description" -p high -s open

# List all issues
centy list issues

# Get a specific issue by display number or UUID
centy get issue 1
centy get issue abc123-uuid

# Shorthand (same as above)
centy issue 1
centy issue abc123-uuid

# Update an issue
centy update issue 1 --status closed
centy update issue 1 --title "New title" --priority high
centy update issue 1 -s in-progress

# Delete an issue
centy delete issue 1
```

**Priority levels:** `low`, `medium`, `high`
**Default statuses:** `open`, `in-progress`, `closed`

### Documentation

```bash
# Create a doc (title required)
centy create doc --title "Getting Started"

# Create with content and custom slug
centy create doc --title "API Reference" --content "# API\nDocumentation here"
centy create doc --title "Guide" --slug my-custom-slug

# Use a template
centy create doc --title "New Feature" --template feature

# List all docs
centy list docs

# Get a specific doc by slug
centy get doc getting-started

# Update a doc
centy update doc getting-started

# Delete a doc
centy delete doc getting-started
```

### Assets

```bash
# Add an asset to an issue
centy add asset ./screenshot.png --issue 1

# Add with custom filename
centy add asset ./image.jpg --issue 1 --name my-image.jpg

# Add a shared asset (accessible by all issues)
centy add asset ./logo.png --shared

# List assets for an issue
centy list assets --issue 1

# List shared assets
centy list assets --shared

# Get an asset and save to file
centy get asset <asset-id> --output ./downloaded.png

# Delete an asset
centy delete asset <asset-id>
```

### Daemon Management

```bash
# Install the daemon
centy install daemon
centy install daemon --version 0.1.0
centy install daemon --force

# Start the daemon
centy start

# Start in foreground (blocks terminal, useful for debugging)
centy start --foreground

# Get daemon info
centy info

# Restart the daemon
centy restart

# Shutdown the daemon gracefully
centy shutdown
```

### Project Info

```bash
# Get project configuration
centy config
centy config --json

# Get project manifest
centy manifest

# Get version info
centy version

# List all tracked projects
centy list projects

# Get info about a specific project
centy get project
```

### Migrations

```bash
# Update project to latest version (runs migrations)
centy update

# Update to a specific version
centy update --target 0.2.0

# Force update without confirmation
centy update --force
```

## The .centy Folder

Centy stores all project data in a `.centy` folder that you can commit to git:

```
.centy/
├── .centy-manifest.json    # Project manifest with file hashes
├── config.json             # Project configuration
├── README.md               # Project README
├── issues/                 # Issue files
│   └── <uuid>/
│       ├── issue.md        # Issue content (markdown)
│       ├── metadata.json   # Issue metadata (status, priority, timestamps)
│       └── assets/         # Issue-specific assets
├── docs/                   # Documentation files
│   └── <slug>/
│       ├── doc.md          # Doc content (markdown)
│       └── metadata.json   # Doc metadata
└── assets/                 # Shared assets (accessible by all issues)
```

All files are human-readable markdown and JSON, making them easy to review in PRs and track in version control.

## Requirements

- Node.js >= 20.0.0
- Centy Daemon (install with `centy install daemon`)

### Supported Platforms

The daemon supports:

- macOS (Intel & Apple Silicon)
- Linux (x86_64 & ARM64)
- Windows (x86_64)

## Development

```bash
# Clone the repository
git clone https://github.com/centy-io/centy-cli.git
cd centy-cli

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Run the CLI locally
./bin/run.js --help
```

## License

MIT
