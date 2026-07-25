import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { EditorInfo } from '../../daemon/types.js'
import { selectEditor } from './select-editor.js'

const mockPrompts = vi.fn()
vi.mock('prompts', () => ({
  default: (...args: unknown[]) => mockPrompts(...args),
}))

const vsCodeEditor: EditorInfo = {
  name: 'VS Code',
  description: 'Visual Studio Code',
  available: true,
  editorId: 'vscode',
  terminalWrapper: false,
}

const terminalEditor: EditorInfo = {
  name: 'Terminal',
  description: 'Terminal editor',
  available: true,
  editorId: 'terminal',
  terminalWrapper: true,
}

describe('selectEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the selected editorId', async () => {
    mockPrompts.mockResolvedValue({ editorId: 'terminal' })

    const result = await selectEditor([vsCodeEditor, terminalEditor])

    expect(result).toBe('terminal')
    expect(mockPrompts).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'select',
        name: 'editorId',
      })
    )
  })

  it('should fall back to first choice if user cancels', async () => {
    mockPrompts.mockResolvedValue({ editorId: undefined })

    const result = await selectEditor([vsCodeEditor, terminalEditor])

    expect(result).toBe('vscode')
  })

  it('should return empty string if no choices available', async () => {
    mockPrompts.mockResolvedValue({ editorId: undefined })

    const result = await selectEditor([])

    expect(result).toBe('')
  })
})
