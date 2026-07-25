/**
 * Error thrown when a requested editor is not available on the system.
 */
export class EditorNotAvailableError extends Error {
  constructor(editorId: string, availableEditorIds: string[]) {
    super(
      `Editor "${editorId}" is not available. Available editors: ${availableEditorIds.join(', ')}`
    )
    this.name = 'EditorNotAvailableError'
  }
}
