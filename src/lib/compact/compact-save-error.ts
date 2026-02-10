export class CompactSaveError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CompactSaveError'
  }
}
