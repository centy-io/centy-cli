import agentConfig from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...agentConfig,
  publishablePackageJson,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.mjs'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    // oclif commands require default exports and static class properties
    files: ['src/commands/**/*.ts'],
    rules: {
      'custom/no-default-class-export': 'off',
      'class-export/class-export': 'off',
      'import/order': 'off',
      'no-restricted-syntax': 'off',
      'max-lines': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    // CLI lib modules require dynamic file operations and small utility modules
    files: ['src/lib/**/*.ts', 'src/utils/**/*.ts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',
      'no-restricted-syntax': 'off',
      'max-lines': 'off',
    },
  },
  {
    // Daemon client modules use gRPC which requires type assertions and multiple exports
    files: ['src/daemon/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'single-export/single-export': 'off',
      'import/order': 'off',
    },
  },
  {
    // TUI modules use React patterns with multiple exports, hooks, and component composition
    files: ['src/tui/**/*.ts', 'src/tui/**/*.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
      'single-export/single-export': 'off',
      'import/order': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'security/detect-object-injection': 'off',
      'no-optional-chaining/no-optional-chaining': 'off',
      'default/no-default-params': 'off',
      'error/no-generic-error': 'off',
      'error/require-custom-error': 'off',
      'custom/jsx-classname-required': 'off',
    },
  },
]
