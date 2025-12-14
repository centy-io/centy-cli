/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines-per-function */

import { useState, useCallback, useRef } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, InputRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import { daemonService } from '../../services/daemon-service.js'
import { FormInput } from '../form/index.js'

export function ProjectCreate() {
  const { goBack, navigate } = useNavigation()
  const { dispatch } = useAppState()

  const [path, setPath] = useState(process.cwd())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pathInputRef = useRef<InputRenderable>(null)

  const handleSubmit = useCallback(async () => {
    if (!path.trim()) {
      setError('Path is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await daemonService.registerProject(path.trim(), {
      autoInit: true,
    })

    setIsSubmitting(false)

    if (result.success) {
      // Refresh projects list and navigate back
      dispatch({ type: 'SET_PROJECTS', projects: [] }) // Clear to force reload
      navigate('projects')
    } else {
      setError(result.error || 'Failed to add project')
    }
  }, [path, dispatch, navigate])

  useKeyboard((event: KeyEvent) => {
    // Cancel with Escape
    if (event.name === 'escape') {
      goBack()
      return
    }

    // Submit with Ctrl+S
    if (event.ctrl && event.name === 's') {
      handleSubmit()
      return
    }

    // Text input is handled by native <input> component
  })

  if (isSubmitting) {
    return (
      <MainPanel title="Add Project">
        <text fg="cyan">Adding project...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title="Add Project">
      <box flexDirection="column" flexGrow={1}>
        {/* Instructions */}
        <box marginBottom={1}>
          <text fg="gray">Ctrl+S: save | Esc: cancel</text>
        </box>

        {/* Error message */}
        {error && (
          <box marginBottom={1}>
            <text fg="red">{error}</text>
          </box>
        )}

        {/* Path field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg="cyan">
            <b>Path</b>
          </text>
          <box paddingLeft={2} borderStyle="single">
            <FormInput
              ref={pathInputRef}
              value={path}
              focused={true}
              placeholder="/path/to/project"
              onInput={setPath}
            />
          </box>
        </box>

        {/* Help text */}
        <box marginTop={1}>
          <text fg="gray">
            The project will be registered and initialized if needed.
          </text>
        </box>

        {/* Submit hint */}
        <box marginTop={1}>
          <text fg="green">Press Ctrl+S to add project</text>
        </box>
      </box>
    </MainPanel>
  )
}
