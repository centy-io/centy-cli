export class CompactParseError extends Error {
  constructor() {
    super(
      'Could not parse LLM response. Expected MIGRATION_CONTENT and COMPACT_CONTENT sections.'
    )
    this.name = 'CompactParseError'
  }
}
