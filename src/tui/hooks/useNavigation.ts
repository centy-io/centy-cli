import { useCallback } from 'react'
import { useAppState } from '../state/app-state.js'
import type { ViewId, ViewParams } from '../types/views.js'

export function useNavigation() {
  const { state, dispatch } = useAppState()

  const navigate = useCallback(
    (view: ViewId, params?: ViewParams) => {
      dispatch({ type: 'NAVIGATE', view, params })
    },
    [dispatch]
  )

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' })
  }, [dispatch])

  const selectSidebarItem = useCallback(
    (index: number) => {
      dispatch({ type: 'SET_SIDEBAR_INDEX', index })
    },
    [dispatch]
  )

  return {
    currentView: state.currentView,
    viewParams: state.viewParams,
    canGoBack: state.viewHistory.length > 0,
    sidebarIndex: state.sidebarIndex,
    navigate,
    goBack,
    selectSidebarItem,
  }
}
