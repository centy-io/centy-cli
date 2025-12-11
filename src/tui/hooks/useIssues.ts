import { useCallback, useEffect } from 'react'
import { useAppState } from '../state/app-state.js'
import { daemonService } from '../services/daemon-service.js'

export function useIssues() {
  const { state, dispatch } = useAppState()

  const loadIssues = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return

    dispatch({ type: 'SET_LOADING', loading: true })
    const result = await daemonService.listIssues(state.selectedProjectPath)
    dispatch({ type: 'SET_LOADING', loading: false })

    if (result.success && result.data) {
      dispatch({ type: 'SET_ISSUES', issues: result.data })
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [state.daemonConnected, state.selectedProjectPath, dispatch])

  const selectIssue = useCallback(
    (id: string | null) => {
      dispatch({ type: 'SELECT_ISSUE', id })
    },
    [dispatch]
  )

  // Load issues when project is selected
  useEffect(() => {
    if (state.selectedProjectPath) {
      loadIssues()
    }
  }, [state.selectedProjectPath, loadIssues])

  return {
    issues: state.issues,
    selectedIssueId: state.selectedIssueId,
    isLoading: state.isLoading,
    loadIssues,
    selectIssue,
  }
}
