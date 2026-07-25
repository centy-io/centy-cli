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
  // The installer URL is the known, intentional default location for the installer
  // script. It is configurable via CENTY_INSTALL_SCRIPT_URL but must have a sensible
  // default value stored in the source code.
  {
    files: ['src/lib/install-script-url.ts'],
    rules: {
      'default/no-hardcoded-urls': 'off',
    },
  },
  // Module files that export multiple related items are explicitly allowed to have
  // multiple exports. These files group related types, constants, and functions that
  // belong together as a cohesive module boundary. Splitting them would fragment
  // related code across too many tiny files without improving cohesion.
  {
    files: [
      'src/utils/resolve-project-path.ts',
      'src/utils/process-timeout-config.ts',
      'src/daemon/load-proto.ts',
      'src/daemon/types/**/*.ts',
      'src/daemon/grpc-utils.ts',
      'src/daemon/grpc-config.ts',
      'src/daemon/daemon-control-service.ts',
      'src/daemon/daemon-get-project-version.ts',
      'src/daemon/check-daemon-connection.ts',
      'src/lib/init/gather-decisions.ts',
      'src/lib/init/type-converters.ts',
      'src/lib/list-items/run-global-list.ts',
      'src/lib/get-doc/cross-project-hint.ts',
      'src/lib/get-doc/handle-not-initialized.ts',
      'src/lib/compact/mark-issues.ts',
      'src/lib/compact/save-results.ts',
      'src/lib/compact/parse-llm-response.ts',
      'src/lib/compact/apply-llm-response.ts',
      'src/lib/close/find-entity.ts',
      'src/lib/get-issue/cross-project-hint.ts',
      'src/lib/get-issue/handle-not-initialized.ts',
      'src/lib/show/search-entities.ts',
      'src/lib/install-daemon/extract.ts',
      'src/lib/install-daemon/platform.ts',
      'src/lib/assert/assert-initialized.ts',
      'src/lib/create-item-type/features.ts',
    ],
    rules: {
      'single-export/single-export': 'off',
    },
  },
  // Test files - allow test-specific patterns
  {
    files: ['**/*.spec.ts'],
    rules: {
      'error/no-literal-error-message': 'off',
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
  // OCLIF command files and hooks - OCLIF requires default class exports and
  // static class property declarations (args, flags, description, examples, aliases).
  // These are framework requirements that cannot be changed.
  {
    files: ['src/commands/**/*.ts', 'src/help.ts', 'src/hooks/**/*.ts'],
    rules: {
      'custom/no-default-class-export': 'off',
      'class-export/class-export': 'off',
      // OCLIF requires static class properties with default values (e.g., static override args = {...})
      // and static class property assignments for command metadata.
      // The PropertyDefinition[value] selector cannot be avoided in OCLIF commands.
      'no-restricted-syntax': 'off',
    },
  },
  // Files that perform file system operations with runtime-computed paths.
  // These are CLI tools that operate on user-specified or system-computed paths,
  // so dynamic file paths are inherent and cannot be made static.
  {
    files: [
      'src/commands/**/*.ts',
      'src/lib/autostart/**/*.ts',
      'src/lib/compact/**/*.ts',
      'src/lib/find-binary/**/*.ts',
      'src/lib/install-daemon/**/*.ts',
      'src/lib/launch-tui/**/*.ts',
      'src/lib/launch-tui-manager/**/*.ts',
      'src/lib/runtime-detection/**/*.ts',
      'src/lib/start/**/*.ts',
    ],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
]
