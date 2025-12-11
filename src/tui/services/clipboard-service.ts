/**
 * Clipboard service for TUI copy functionality
 * Uses clipboardy for cross-platform clipboard access
 */

import clipboard from 'clipboardy'

export interface ClipboardResult {
  success: boolean
  error?: string
}

export class ClipboardService {
  async copy(text: string): Promise<ClipboardResult> {
    try {
      await clipboard.write(text)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to copy to clipboard',
      }
    }
  }

  async read(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const text = await clipboard.read()
      return { success: true, data: text }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to read from clipboard',
      }
    }
  }
}

export const clipboardService = new ClipboardService()
