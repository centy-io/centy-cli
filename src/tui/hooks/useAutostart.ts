import { useState, useEffect, useCallback, useMemo } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { launchdService } from '../../lib/autostart/launchd.js'
import { findDaemonBinary } from '../../lib/start/find-daemon-binary.js'
import { daemonBinaryExists } from '../../lib/start/daemon-binary-exists.js'

export type AutostartState = 'idle' | 'confirming' | 'executing'

interface UseAutostartParams {
  enabled: boolean
}

interface AutostartHookState {
  autostartEnabled: boolean | null
  daemonPath: string | null
  state: AutostartState
  message: string | null
}

function handleKeyEvent(
  event: KeyEvent,
  hookState: AutostartHookState,
  callbacks: {
    toggleAutostart: () => void
    resetState: () => void
    setConfirming: (msg: string) => void
  }
) {
  if (hookState.state === 'executing') return

  if (hookState.state === 'confirming') {
    if (event.name === 'y' || event.name === 'Y') callbacks.toggleAutostart()
    if (event.name === 'n' || event.name === 'N' || event.name === 'escape')
      callbacks.resetState()
    return
  }

  if (event.name === 'a' && process.platform === 'darwin') {
    const msg = hookState.autostartEnabled
      ? 'Disable autostart on boot? (y/n)'
      : 'Enable autostart on boot? (y/n)'
    callbacks.setConfirming(msg)
  }
}

async function performAutostartToggle(
  autostartEnabled: boolean | null,
  setters: {
    setAutostartEnabled: (val: boolean) => void
    setDaemonPath: (val: string | null) => void
    setMessage: (val: string | null) => void
    setState: (val: AutostartState) => void
  }
) {
  if (autostartEnabled) {
    launchdService.disableAutostart()
    setters.setAutostartEnabled(false)
    setters.setDaemonPath(null)
    return 'Autostart disabled'
  }
  const binaryPath = findDaemonBinary()
  if (!daemonBinaryExists(binaryPath)) {
    setters.setState('idle')
    throw new Error('Daemon binary not found')
  }
  launchdService.enableAutostart(binaryPath)
  setters.setAutostartEnabled(true)
  setters.setDaemonPath(binaryPath)
  return 'Autostart enabled'
}

export function useAutostart({ enabled }: UseAutostartParams) {
  const [autostartEnabled, setAutostartEnabled] = useState<boolean | null>(null)
  const [daemonPath, setDaemonPath] = useState<string | null>(null)
  const [state, setState] = useState<AutostartState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || process.platform !== 'darwin') return
    const status = launchdService.getAutostartStatus()
    setAutostartEnabled(status.enabled)
    setDaemonPath(status.daemonPath || null)
  }, [enabled])

  const resetState = useCallback(() => {
    setState('idle')
    setMessage(null)
  }, [])

  const setConfirming = useCallback((msg: string) => {
    setState('confirming')
    setMessage(msg)
  }, [])

  const toggleAutostart = useCallback(async () => {
    setState('executing')
    setMessage(autostartEnabled ? 'Disabling...' : 'Enabling...')
    try {
      const result = await performAutostartToggle(autostartEnabled, {
        setAutostartEnabled,
        setDaemonPath,
        setMessage,
        setState,
      })
      setMessage(result)
      setTimeout(() => {
        setMessage(null)
        setState('idle')
      }, 2000)
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`)
      setState('idle')
    }
  }, [autostartEnabled])

  const hookState = useMemo(
    () => ({ autostartEnabled, daemonPath, state, message }),
    [autostartEnabled, daemonPath, state, message]
  )

  const callbacks = useMemo(
    () => ({ toggleAutostart, resetState, setConfirming }),
    [toggleAutostart, resetState, setConfirming]
  )

  useKeyboard(
    useCallback(
      (event: KeyEvent) => {
        if (!enabled) return
        handleKeyEvent(event, hookState, callbacks)
      },
      [enabled, hookState, callbacks]
    )
  )

  return {
    autostartEnabled,
    daemonPath,
    state,
    message,
    isSupported: process.platform === 'darwin',
  }
}
