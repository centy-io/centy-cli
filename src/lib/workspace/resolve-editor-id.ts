import type { EditorInfo } from '../../daemon/types.js'
import { EditorNotAvailableError } from './editor-not-available-error.js'
import { selectEditor } from './select-editor.js'

/**
 * Resolve the editor ID to use based on the --editor flag and available editors.
 * - If editorFlag is provided, validate it and return it
 * - If only one editor is available, use it automatically
 * - If multiple editors are available, prompt for selection
 * - Returns empty string to let daemon use project/user default
 */
export async function resolveEditorId(
  editorFlag: string | undefined,
  availableEditors: EditorInfo[]
): Promise<string> {
  if (editorFlag !== undefined) {
    const found = availableEditors.find(e => e.editorId === editorFlag)
    if (found === undefined || !found.available) {
      throw new EditorNotAvailableError(
        editorFlag,
        availableEditors.filter(e => e.available).map(e => e.editorId)
      )
    }
    return editorFlag
  }

  const available = availableEditors.filter(e => e.available)

  if (available.length === 0) {
    return ''
  }

  if (available.length === 1) {
    const first = available[0]
    return first !== undefined ? first.editorId : ''
  }

  return selectEditor(available)
}
