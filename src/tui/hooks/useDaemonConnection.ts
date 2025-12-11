import { useCallback, useEffect } from 'react'
import { useAppState } from '../state/app-state.js'
import { daemonService } from '../services/daemon-service.js'

export function useDaemonConnection() {
  const { state, dispatch } = useAppState()

  const checkConnection = useCallback(async () => {
    const result = await daemonService.checkConnection()
    dispatch({ type: 'SET_DAEMON_STATUS', connected: result.connected })
    if (!result.connected && result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [dispatch])

  // Initial check and periodic polling
  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 10000)
    return () => clearInterval(interval)
  }, [checkConnection])

  return {
    connected: state.daemonConnected,
    retry: checkConnection,
  }
}
