import { useState, useCallback } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { daemonService } from '../services/daemon-service.js'

export type ActionState = 'idle' | 'confirming' | 'executing'
export type DaemonAction = 'shutdown' | 'restart'

interface UseDaemonActionsParams {
  connected: boolean
  retry: () => void
}

async function performAction(action: DaemonAction) {
  return action === 'shutdown'
    ? daemonService.shutdown()
    : daemonService.restart()
}

function getActionMessages(action: DaemonAction) {
  return {
    executing: action === 'shutdown' ? 'Shutting down...' : 'Restarting...',
    success:
      action === 'shutdown'
        ? 'Daemon shut down successfully'
        : 'Daemon restarting...',
    confirm:
      action === 'shutdown'
        ? 'Shutdown daemon? (y/n)'
        : 'Restart daemon? (y/n)',
  }
}

export function useDaemonActions({ connected, retry }: UseDaemonActionsParams) {
  const [actionState, setActionState] = useState<ActionState>('idle')
  const [pendingAction, setPendingAction] = useState<DaemonAction | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const resetState = useCallback(() => {
    setActionState('idle')
    setPendingAction(null)
  }, [])

  const executeAction = useCallback(
    async (action: DaemonAction) => {
      const messages = getActionMessages(action)
      setActionState('executing')
      setActionMessage(messages.executing)

      const result = await performAction(action)
      if (result.success) {
        setActionMessage(result.data?.message || messages.success)
        setTimeout(() => {
          retry()
          resetState()
        }, 2000)
      } else {
        setActionMessage(`Error: ${result.error}`)
        resetState()
      }
    },
    [retry, resetState]
  )

  useKeyboard((event: KeyEvent) => {
    if (actionState === 'executing') return

    if (actionState === 'confirming') {
      const isConfirm = event.name === 'y' || event.name === 'Y'
      const isCancel =
        event.name === 'n' || event.name === 'N' || event.name === 'escape'
      if (isConfirm && pendingAction) executeAction(pendingAction)
      if (isCancel) {
        resetState()
        setActionMessage(null)
      }
      return
    }

    if (event.name === 's' && connected) {
      setActionState('confirming')
      setPendingAction('shutdown')
      setActionMessage(getActionMessages('shutdown').confirm)
    } else if (event.name === 'r' && connected) {
      setActionState('confirming')
      setPendingAction('restart')
      setActionMessage(getActionMessages('restart').confirm)
    } else if (event.name === 'c') {
      retry()
      setActionMessage('Checking connection...')
      setTimeout(() => setActionMessage(null), 1500)
    }
  })

  return { actionState, actionMessage }
}
