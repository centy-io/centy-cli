import { describe, expect, it, vi, beforeEach } from 'vitest'
import { EditorNotAvailableError } from './editor-not-available-error.js'
// eslint-disable-next-line import/order
import type { EditorInfo } from '../../daemon/types.js'

const mockSelectEditor = vi.fn()
vi.mock('./select-editor.js', () => ({
  selectEditor: (...args: unknown[]) => mockSelectEditor(...args),
}))

// eslint-disable-next-line import/first
import { resolveEditorId } from './resolve-editor-id.js'

const vsCodeEditor: EditorInfo = {
  editorType: 0,
  name: 'VS Code',
  description: 'Visual Studio Code',
  available: true,
  editorId: 'vscode',
  terminalWrapper: false,
}

const terminalEditor: EditorInfo = {
  editorType: 1,
  name: 'Terminal',
  description: 'Terminal editor',
  available: true,
  editorId: 'terminal',
  terminalWrapper: true,
}

const unavailableEditor: EditorInfo = {
  editorType: 0,
  name: 'Zed',
  description: 'Zed editor',
  available: false,
  editorId: 'zed',
  terminalWrapper: false,
}

describe('resolveEditorId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the editor flag value when provided and available', async () => {
    const result = await resolveEditorId('vscode', [
      vsCodeEditor,
      terminalEditor,
    ])

    expect(result).toBe('vscode')
    expect(mockSelectEditor).not.toHaveBeenCalled()
  })

  it('should throw EditorNotAvailableError when editor flag is unavailable', async () => {
    await expect(
      resolveEditorId('zed', [vsCodeEditor, unavailableEditor])
    ).rejects.toBeInstanceOf(EditorNotAvailableError)
  })

  it('should throw EditorNotAvailableError when editor flag is not in list', async () => {
    await expect(
      resolveEditorId('zed', [vsCodeEditor, terminalEditor])
    ).rejects.toBeInstanceOf(EditorNotAvailableError)
  })

  it('should return empty string when no editors are available', async () => {
    const result = await resolveEditorId(undefined, [unavailableEditor])

    expect(result).toBe('')
    expect(mockSelectEditor).not.toHaveBeenCalled()
  })

  it('should auto-select when only one editor is available', async () => {
    const result = await resolveEditorId(undefined, [
      vsCodeEditor,
      unavailableEditor,
    ])

    expect(result).toBe('vscode')
    expect(mockSelectEditor).not.toHaveBeenCalled()
  })

  it('should show selection prompt when multiple editors are available', async () => {
    mockSelectEditor.mockResolvedValue('terminal')

    const result = await resolveEditorId(undefined, [
      vsCodeEditor,
      terminalEditor,
    ])

    expect(result).toBe('terminal')
    expect(mockSelectEditor).toHaveBeenCalledWith([
      vsCodeEditor,
      terminalEditor,
    ])
  })
})
