import Get from './get.js'

/**
 * Alias for `get`. Get any item by type and identifier.
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Show extends Get {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Alias for `get`. Get an item by type and identifier'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> show issue 1',
    '<%= config.bin %> show issue abc123-uuid',
    '<%= config.bin %> show doc getting-started',
    '<%= config.bin %> show user john-doe',
    '<%= config.bin %> show epic 1',
    '<%= config.bin %> show bug abc123-uuid --json',
    '<%= config.bin %> show issue abc123-uuid --global',
    '<%= config.bin %> show issue 1 --project centy-daemon',
  ]
}
