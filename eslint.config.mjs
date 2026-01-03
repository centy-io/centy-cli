import agentConfig from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...agentConfig,
  publishablePackageJson,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.mjs', 'package.json'],
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
  // Test utility files - allow test-specific patterns
  {
    files: ['**/testing/**/*.ts', '**/command-test-utils.ts'],
    rules: {
      'single-export/single-export': 'off',
      'error/no-generic-error': 'off',
      'error/require-custom-error': 'off',
      'no-restricted-syntax': 'off',
    },
  },
]
