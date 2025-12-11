/* eslint-disable ddd/require-spec-file */
import { useCallback, useEffect, useState } from 'react'
import { useAppState } from '../state/app-state.js'
import { daemonService } from '../services/daemon-service.js'
import type { Asset } from '../../daemon/types.js'

export function useAssets() {
  const { state, dispatch } = useAppState()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadAssets = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return

    setIsLoading(true)
    const result = await daemonService.listAssets(state.selectedProjectPath, {
      includeShared: true,
    })
    setIsLoading(false)

    if (result.success && result.data) {
      setAssets(result.data)
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [state.daemonConnected, state.selectedProjectPath, dispatch])

  // Load assets when project is selected
  useEffect(() => {
    if (state.selectedProjectPath) {
      loadAssets()
    }
  }, [state.selectedProjectPath, loadAssets])

  return {
    assets,
    isLoading,
    loadAssets,
  }
}
