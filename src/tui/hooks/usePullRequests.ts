import { useCallback, useEffect } from 'react'
import { useAppState } from '../state/app-state.js'
import { daemonService } from '../services/daemon-service.js'

export function usePullRequests() {
  const { state, dispatch } = useAppState()

  const loadPrs = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return

    dispatch({ type: 'SET_LOADING', loading: true })
    const result = await daemonService.listPrs(state.selectedProjectPath)
    dispatch({ type: 'SET_LOADING', loading: false })

    if (result.success && result.data) {
      dispatch({ type: 'SET_PRS', prs: result.data })
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [state.daemonConnected, state.selectedProjectPath, dispatch])

  const selectPr = useCallback(
    (id: string | null) => {
      dispatch({ type: 'SELECT_PR', id })
    },
    [dispatch]
  )

  // Load PRs when project is selected
  useEffect(() => {
    if (state.selectedProjectPath) {
      loadPrs()
    }
  }, [state.selectedProjectPath, loadPrs])

  return {
    prs: state.prs,
    selectedPrId: state.selectedPrId,
    isLoading: state.isLoading,
    loadPrs,
    selectPr,
  }
}
