import prompts from 'prompts'
import type { EditorInfo } from '../../daemon/types.js'

/**
 * Prompt the user to select an editor from available editors.
 * Returns the editorId of the chosen editor.
 */
export async function selectEditor(availableEditors: EditorInfo[]): Promise<string> {
  const choices = availableEditors.map(e => ({
    title: e.name,
    description: e.description,
    value: e.editorId,
  }))

  const response = await prompts({
    type: 'select',
    name: 'editorId',
    message: 'Select an editor',
    choices,
  })

  // If user cancels (e.g. Ctrl+C), fall back to first available
  if (response.editorId === undefined) {
    const firstChoice = choices[0]
    return firstChoice !== undefined ? firstChoice.value : ''
  }

  return response.editorId
}
