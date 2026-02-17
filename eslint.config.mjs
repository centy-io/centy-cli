import agentConfig from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...agentConfig,
  publishablePackageJson,
  {
    ignores: ['dist/**', 'node_modules/**', 'src/daemon/generated/**', '*.config.js', '*.config.mjs', 'package.json'],
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
  // Test files - allow test-specific patterns
  {
    files: ['**/*.spec.ts'],
    rules: {
      'error/no-literal-error-message': 'off',
    },
  },
  // Integration and top-level spec files don't require a 1:1 implementation file
  {
    files: ['**/*.integration.spec.ts', 'src/cli.spec.ts'],
    rules: {
      'ddd/require-spec-file': 'off',
    },
  },
  // Test utility files - allow test-specific patterns
  {
    files: ['**/testing/**/*.ts', '**/command-test-utils.ts'],
    rules: {
      'single-export/single-export': 'off',
      'error/no-generic-error': 'off',
      'error/require-custom-error': 'off',
      'error/no-literal-error-message': 'off',
      'no-restricted-syntax': 'off',
    },
  },
]
