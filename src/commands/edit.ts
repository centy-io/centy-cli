import Update from './update.js'

/**
 * Alias for `update`. Update any item by type and identifier.
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Edit extends Update {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Alias for `update`. Update an item by type and identifier'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> edit issue 1 --status closed',
    '<%= config.bin %> edit epic 1 --title "New title"',
    '<%= config.bin %> edit bug abc123-uuid --status in-progress --priority 1',
    '<%= config.bin %> edit issue 1 --project centy-daemon',
  ]
}
