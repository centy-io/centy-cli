# Contributing to Centy

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `pnpm install`
3. **Create a branch** for your changes: `git checkout -b feature/your-feature-name`

## Development Workflow

### Prerequisites

- Node.js >= 20.0.0
- pnpm (latest version)

### Setup

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Development Commands

- `pnpm dev` - Build in watch mode
- `pnpm test` - Run tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm lint` - Check code quality
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code
- `pnpm format:check` - Check formatting
- `pnpm spell` - Check spelling
- `pnpm knip` - Find unused files, dependencies, and exports

## Making Changes

### Code Style

This project uses:

- **TypeScript** with strict mode
- **ESLint** with `eslint-config-agent` for linting
- **Prettier** for code formatting
- **cspell** for spell checking

The codebase follows these conventions:

- ES modules (use `.js` extensions in imports)
- Strict TypeScript types
- Descriptive variable and function names
- Comprehensive JSDoc comments for public APIs

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:

```
feat(api): add user authentication endpoint
fix(parser): handle edge case in date parsing
docs(readme): update installation instructions
```

### Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass: `pnpm test`
- Maintain or improve code coverage
- Tests should be in `.spec.ts` files next to their corresponding logic files (DDD approach)
- Use descriptive test names

### Git Hooks

This project uses Husky for git hooks:

- **Pre-commit**: Runs lint-staged (lints, formats, and spell-checks staged files)
- **Commit-msg**: Validates commit message format using commitlint (enforces conventional commits)
- **Pre-push**: Runs full validation (lint, format, spell, knip, tests)

These hooks ensure code quality and consistent commit messages before commits and pushes.

**Important**: Commit messages must follow the conventional commits format or they will be rejected. See the "Commit Messages" section above for details.

## Submitting Changes

### Pull Request Process

1. **Update your fork** with the latest changes from main:

   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Rebase your branch** (if needed):

   ```bash
   git checkout your-branch
   git rebase main
   ```

3. **Run all checks locally**:

   ```bash
   pnpm lint
   pnpm format:check
   pnpm spell
   pnpm knip
   pnpm test
   pnpm build
   ```

4. **Push your changes**:

   ```bash
   git push origin your-branch
   ```

5. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to any related issues
   - Screenshots (if UI changes)

### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Write clear, descriptive PR titles and descriptions
- Link related issues using "Fixes #123" or "Closes #123"
- Ensure CI passes (tests, linting, formatting)
- Respond to review feedback promptly
- Keep commits clean and well-organized

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: Node.js version, OS, package version
- **Error messages**: Full error messages or stack traces
- **Code samples**: Minimal reproduction if possible

### Feature Requests

When requesting features, please include:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: What alternatives have you considered?
- **Examples**: Examples of similar features elsewhere

## Publishing (Maintainers Only)

To publish a new version:

1. **Update the version** in `package.json`:

   ```bash
   # For patch release (0.0.14 -> 0.0.15)
   # Edit package.json and update the version field
   ```

2. **Commit and push** to main:

   ```bash
   git add package.json
   git commit -m "chore(release): bump version to X.X.X"
   git push
   ```

3. **CI/CD handles the rest**: The GitHub Actions workflow automatically publishes to npm when a version change is detected on main.

## Questions?

- Check existing issues and discussions
- Read the documentation in README.md
- Open a new issue with the "question" label

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and beginners
- Focus on constructive feedback
- Assume good intentions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for contributing!
