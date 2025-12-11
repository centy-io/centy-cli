import { useCallback, useEffect } from 'react'
import { useAppState } from '../state/app-state.js'
import { daemonService } from '../services/daemon-service.js'

export function useProjects() {
  const { state, dispatch } = useAppState()

  const loadProjects = useCallback(async () => {
    if (!state.daemonConnected) return

    dispatch({ type: 'SET_LOADING', loading: true })
    const result = await daemonService.listProjects({
      includeStale: true,
      includeUninitialized: false,
      includeArchived: false,
    })
    dispatch({ type: 'SET_LOADING', loading: false })

    if (result.success && result.data) {
      dispatch({ type: 'SET_PROJECTS', projects: result.data })
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [state.daemonConnected, dispatch])

  const selectProject = useCallback(
    (path: string) => {
      dispatch({ type: 'SELECT_PROJECT', path })
    },
    [dispatch]
  )

  const toggleFavorite = useCallback(
    async (path: string, isFavorite: boolean) => {
      const result = await daemonService.setProjectFavorite(path, isFavorite)
      if (result.success && result.data) {
        // Update the project in the list
        dispatch({ type: 'UPDATE_PROJECT', project: result.data })
      }
    },
    [dispatch]
  )

  const toggleArchive = useCallback(
    async (path: string, isArchived: boolean) => {
      const result = await daemonService.setProjectArchived(path, isArchived)
      if (result.success && result.data) {
        // Remove the project from the list when archived (since we filter archived projects)
        if (isArchived) {
          dispatch({ type: 'REMOVE_PROJECT', path })
        } else {
          dispatch({ type: 'UPDATE_PROJECT', project: result.data })
        }
      }
    },
    [dispatch]
  )

  const untrackProject = useCallback(
    async (path: string) => {
      const result = await daemonService.untrackProject(path)
      if (result.success) {
        // Remove the project from the list
        dispatch({ type: 'REMOVE_PROJECT', path })
      }
      return result
    },
    [dispatch]
  )

  // Load projects when daemon connects
  useEffect(() => {
    if (state.daemonConnected && state.projects.length === 0) {
      loadProjects()
    }
  }, [state.daemonConnected, state.projects.length, loadProjects])

  return {
    projects: state.projects,
    selectedProjectPath: state.selectedProjectPath,
    isLoading: state.isLoading,
    loadProjects,
    selectProject,
    toggleFavorite,
    toggleArchive,
    untrackProject,
  }
}
