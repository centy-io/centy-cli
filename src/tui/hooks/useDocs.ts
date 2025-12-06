import { useCallback, useEffect, useState } from 'react'
import { useAppState } from '../state/app-state.js'
import { daemonService } from '../services/daemon-service.js'
import type { Doc } from '../../daemon/types.js'

export function useDocs() {
  const { state, dispatch } = useAppState()
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)

  const loadDocs = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return

    dispatch({ type: 'SET_LOADING', loading: true })
    const result = await daemonService.listDocs(state.selectedProjectPath)
    dispatch({ type: 'SET_LOADING', loading: false })

    if (result.success && result.data) {
      dispatch({ type: 'SET_DOCS', docs: result.data })
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [state.daemonConnected, state.selectedProjectPath, dispatch])

  const selectDoc = useCallback(
    (slug: string | null) => {
      dispatch({ type: 'SELECT_DOC', slug })
    },
    [dispatch]
  )

  const loadDoc = useCallback(
    async (slug: string) => {
      if (!state.daemonConnected || !state.selectedProjectPath) return

      setIsLoadingDoc(true)
      const result = await daemonService.getDoc(state.selectedProjectPath, slug)
      setIsLoadingDoc(false)

      if (result.success && result.data) {
        setSelectedDoc(result.data)
      } else if (result.error) {
        dispatch({ type: 'SET_ERROR', error: result.error })
      }
    },
    [state.daemonConnected, state.selectedProjectPath, dispatch]
  )

  // Load docs when project is selected
  useEffect(() => {
    if (state.selectedProjectPath) {
      loadDocs()
    }
  }, [state.selectedProjectPath, loadDocs])

  return {
    docs: state.docs,
    selectedDocSlug: state.selectedDocSlug,
    selectedDoc,
    isLoading: state.isLoading,
    isLoadingDoc,
    loadDocs,
    selectDoc,
    loadDoc,
  }
}
