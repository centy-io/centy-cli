import { useEffect, useRef } from 'react'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { useAppState } from '../state/app-state.js'
import { useNavigation } from './useNavigation.js'

const CENTY_FOLDER = '.centy'

/**
 * Hook that auto-selects a project if the current working directory
 * contains a .centy folder and matches a registered project.
 *
 * This provides a better UX when launching the TUI from within a project directory.
 */
export function useAutoSelectProject() {
  const { state, dispatch } = useAppState()
  const { navigate } = useNavigation()
  const hasAutoSelected = useRef(false)

  useEffect(() => {
    // Only run once and when we have projects loaded
    if (hasAutoSelected.current) return
    if (!state.daemonConnected) return
    if (state.projects.length === 0) return
    if (state.selectedProjectPath) return // Already has a selection

    const cwd = process.cwd()
    const centyPath = join(cwd, CENTY_FOLDER)

    // Check if current directory has a .centy folder
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- path is from process.cwd() which is trusted
    if (!existsSync(centyPath)) return

    // Find matching project in the list
    const matchingProject = state.projects.find(project => project.path === cwd)

    if (matchingProject) {
      hasAutoSelected.current = true
      dispatch({ type: 'SELECT_PROJECT', path: matchingProject.path })
      navigate('issues')
    }
  }, [
    state.daemonConnected,
    state.projects,
    state.selectedProjectPath,
    dispatch,
    navigate,
  ])
}
