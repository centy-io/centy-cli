/* eslint-disable ddd/require-spec-file */
import { useCallback, useEffect } from 'react'
import { useAppState } from '../state/app-state.js'
import { daemonService } from '../services/daemon-service.js'

export function useConfig() {
  const { state, dispatch } = useAppState()

  const loadConfig = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return

    dispatch({ type: 'SET_LOADING', loading: true })
    const result = await daemonService.getConfig(state.selectedProjectPath)
    dispatch({ type: 'SET_LOADING', loading: false })

    if (result.success && result.data) {
      dispatch({ type: 'SET_CONFIG', config: result.data })
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [state.daemonConnected, state.selectedProjectPath, dispatch])

  // Load config when project is selected
  useEffect(() => {
    if (state.selectedProjectPath && !state.config) {
      loadConfig()
    }
  }, [state.selectedProjectPath, state.config, loadConfig])

  return {
    config: state.config,
    isLoading: state.isLoading,
    loadConfig,
  }
}
