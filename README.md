# Centy CLI

CLI for managing project issues and docs via code in the `.centy` folder.

## Installation

```bash
# Using npm
npm install -g centy

# Using pnpm
pnpm add -g centy

# Or run directly with npx/pnpm dlx
pnpm dlx centy
```

## Quick Start

```bash
# Initialize centy in your project
centy init

# Create an issue
centy create issue --title "Fix login bug" --priority high

# List issues
centy list issues

# Open interactive TUI mode
centy
```

## Interactive TUI Mode

Running `centy` without any arguments opens a full-screen interactive terminal UI:

```
┌─────────────────────────────────────────────────────┐
│ Centy                              ● Daemon: Connected │
├──────────────┬──────────────────────────────────────┤
│ Projects     │                                      │
│ > Issues     │  Issue List                          │
│   Docs       │  ─────────────────────────           │
│   Assets     │  #1 [high] Fix login bug             │
│   Config     │  #2 [med]  Add dark mode             │
│   Daemon     │  #3 [low]  Update docs               │
├──────────────┴──────────────────────────────────────┤
│ j/k: navigate  Enter: select  Tab: switch view  q: quit │
└─────────────────────────────────────────────────────┘
```

### TUI Keyboard Shortcuts

| Key       | Action                 |
| --------- | ---------------------- |
| `j` / `↓` | Move down              |
| `k` / `↑` | Move up                |
| `Enter`   | Select item            |
| `Tab`     | Switch view            |
| `1-6`     | Quick navigate to view |
| `q`       | Quit                   |

## Commands

### Project Management

```bash
# Initialize a .centy folder
centy init

# Register a project for tracking
centy register project

# Remove a project from tracking
centy untrack project
```

### Issues

```bash
# Create an issue
centy create issue --title "Bug fix" --description "Fix the bug" --priority high

# List all issues
centy list issues

# Get a specific issue
centy get issue <id>

# Update an issue
centy update issue <id> --status closed

# Delete an issue
centy delete issue <id>
```

### Documentation

```bash
# Create a doc
centy create doc --slug "getting-started" --title "Getting Started"

# List all docs
centy list docs

# Get a specific doc
centy get doc <slug>

# Update a doc
centy update doc <slug>

# Delete a doc
centy delete doc <slug>
```

### Assets

```bash
# Add an asset to an issue
centy add asset --issue <id> --file ./screenshot.png

# Add a shared asset
centy add asset --file ./logo.png

# List assets
centy list assets

# Get an asset
centy get asset <id> --output ./downloaded.png

# Delete an asset
centy delete asset <id>
```

### Daemon Management

```bash
# Start the daemon
centy start

# Get daemon info
centy info

# Restart the daemon
centy restart

# Shutdown the daemon
centy shutdown
```

### Project Info

```bash
# Get project configuration
centy config

# Get project manifest
centy manifest

# Get version info
centy version
```

## The .centy Folder

Centy stores all project data in a `.centy` folder:

```
.centy/
├── .centy-manifest.json    # Project manifest
├── issues/                 # Issue files
│   └── <uuid>/
│       ├── issue.md        # Issue content
│       └── metadata.json   # Issue metadata
├── docs/                   # Documentation files
│   └── <slug>/
│       ├── doc.md          # Doc content
│       └── metadata.json   # Doc metadata
└── assets/                 # Asset files
```

## Requirements

- Node.js >= 20.0.0
- Centy Daemon (automatically managed)

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
