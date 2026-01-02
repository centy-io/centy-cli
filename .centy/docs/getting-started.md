---
title: 'Getting Started'
createdAt: '2025-12-05T12:34:42.605935+00:00'
updatedAt: '2025-12-05T12:34:42.605935+00:00'
---

# Getting Started

Get up and running with Centy in minutes.

## What is Centy?

Centy is a CLI tool for managing project issues and documentation as code. All data is stored in a `.centy` folder in your project, making it version-controlled and portable.

## Installation

```bash
npm install -g centy
```

## Quick Start

### 1. Initialize Your Project

```bash
cd your-project
centy init
```

This creates a `.centy` folder with the project structure.

### 2. Create Your First Issue

```bash
centy create issue --title "Setup CI/CD" --priority high
```

### 3. View Issues

```bash
centy list issues
```

Or open the interactive TUI:

```bash
centy
```

### 4. Create Documentation

```bash
centy create doc --slug "readme" --title "Project README"
```

## Interactive Mode

Running `centy` without arguments opens a full-screen dashboard where you can:

- Browse projects, issues, and docs
- Navigate with keyboard shortcuts (j/k, Enter, Tab)
- Quick access views with number keys (1-6)

## Next Steps

- See [CLI Reference](cli-reference) for all commands
- Check [TUI Guide](tui-guide) for interactive mode details
