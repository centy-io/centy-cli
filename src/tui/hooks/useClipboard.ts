import { useCallback, useRef } from 'react'
import { useAppState } from '../state/app-state.js'
import { clipboardService } from '../services/clipboard-service.js'

const COPY_MESSAGE_DURATION = 2000 // 2 seconds

export function useClipboard() {
  const { state, dispatch } = useAppState()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(
    async (text: string, label?: string): Promise<boolean> => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const result = await clipboardService.copy(text)

      if (result.success) {
        const message = label ? `Copied ${label}` : 'Copied!'
        dispatch({ type: 'SET_COPY_MESSAGE', message })

        // Auto-clear message after duration
        timeoutRef.current = setTimeout(() => {
          dispatch({ type: 'SET_COPY_MESSAGE', message: null })
        }, COPY_MESSAGE_DURATION)

        return true
      } else {
        dispatch({
          type: 'SET_COPY_MESSAGE',
          message: result.error ?? 'Copy failed',
        })

        timeoutRef.current = setTimeout(() => {
          dispatch({ type: 'SET_COPY_MESSAGE', message: null })
        }, COPY_MESSAGE_DURATION)

        return false
      }
    },
    [dispatch]
  )

  const clearCopyMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    dispatch({ type: 'SET_COPY_MESSAGE', message: null })
  }, [dispatch])

  return {
    copy,
    copyMessage: state.copyMessage,
    clearCopyMessage,
  }
}
