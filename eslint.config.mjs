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
      'ddd/require-spec-file': 'off',
    },
  },
  {
    // oclif commands require default exports and static class properties
    files: ['src/commands/**/*.ts'],
    rules: {
      'custom/no-default-class-export': 'off',
      'class-export/class-export': 'off',
      'import/order': 'off',
      'ddd/require-spec-file': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    // CLI lib modules require dynamic file operations and small utility modules
    files: ['src/lib/**/*.ts', 'src/utils/**/*.ts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',
      'ddd/require-spec-file': 'off',
      'no-restricted-syntax': 'off',
      'max-lines': 'off',
    },
  },
]
