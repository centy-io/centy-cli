---
title: 'CLI Reference'
createdAt: '2025-12-05T12:29:10.781937+00:00'
updatedAt: '2025-12-05T12:29:10.781937+00:00'
---

# CLI Reference

Complete reference for all Centy CLI commands.

## Installation

```bash
# Using npm
npm install -g centy

# Using pnpm
pnpm add -g centy

# Run directly
pnpm dlx centy
```

## Interactive Mode

Running `centy` without arguments opens the interactive TUI:

| Key     | Action           |
| ------- | ---------------- |
| `j/k`   | Navigate up/down |
| `Enter` | Select item      |
| `Tab`   | Switch view      |
| `1-6`   | Quick navigate   |
| `q`     | Quit             |

## Commands

### Project Setup

| Command                  | Description                   |
| ------------------------ | ----------------------------- |
| `centy init`             | Initialize .centy folder      |
| `centy register project` | Register project for tracking |
| `centy untrack project`  | Remove project from tracking  |

### Issues

| Command                   | Description        |
| ------------------------- | ------------------ |
| `centy create issue`      | Create a new issue |
| `centy list issues`       | List all issues    |
| `centy get issue <id>`    | Get issue details  |
| `centy update issue <id>` | Update an issue    |
| `centy delete issue <id>` | Delete an issue    |

**Options for `create issue`:**

- `--title` - Issue title (required)
- `--description` - Issue description
- `--priority` - low, medium, high

### Documentation

| Command                   | Description      |
| ------------------------- | ---------------- |
| `centy create doc`        | Create a new doc |
| `centy list docs`         | List all docs    |
| `centy get doc <slug>`    | Get doc content  |
| `centy update doc <slug>` | Update a doc     |
| `centy delete doc <slug>` | Delete a doc     |

**Options for `create doc`:**

- `--slug` - URL-friendly identifier (required)
- `--title` - Document title (required)

### Assets

| Command                   | Description    |
| ------------------------- | -------------- |
| `centy add asset`         | Add an asset   |
| `centy list assets`       | List assets    |
| `centy get asset <id>`    | Download asset |
| `centy delete asset <id>` | Delete asset   |

**Options for `add asset`:**

- `--file` - Path to file (required)
- `--issue` - Attach to issue (optional)

### Daemon

| Command          | Description    |
| ---------------- | -------------- |
| `centy start`    | Start daemon   |
| `centy info`     | Daemon status  |
| `centy restart`  | Restart daemon |
| `centy shutdown` | Stop daemon    |

### Info

| Command          | Description           |
| ---------------- | --------------------- |
| `centy config`   | Show project config   |
| `centy manifest` | Show project manifest |
| `centy version`  | Show version info     |
