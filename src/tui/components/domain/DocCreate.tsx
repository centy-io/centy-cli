/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines-per-function, max-lines */

import { useState, useCallback, useRef } from 'react'
import { useKeyboard } from '@opentui/react'
import type {
  KeyEvent,
  InputRenderable,
  TextareaRenderable,
} from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import { daemonService } from '../../services/daemon-service.js'
import { FormInput, FormTextarea } from '../form/index.js'

type FormField = 'title' | 'content'

const FIELDS: FormField[] = ['title', 'content']

export function DocCreate() {
  const { goBack, navigate } = useNavigation()
  const { state, dispatch } = useAppState()

  const [title, setTitle] = useState('')
  const [activeField, setActiveField] = useState<FormField>('title')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleInputRef = useRef<InputRenderable>(null)
  const contentRef = useRef<TextareaRenderable>(null)

  const handleSubmit = useCallback(async () => {
    if (!state.selectedProjectPath) return
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
    const contentText = contentRef.current?.plainText ?? ''

    const result = await daemonService.createDoc(state.selectedProjectPath, {
      title: title.trim(),
      content: contentText.trim(),
    })

    setIsSubmitting(false)

    if (result.success) {
      // Refresh docs list and navigate back
      dispatch({ type: 'SET_DOCS', docs: [] }) // Clear to force reload
      navigate('docs')
    } else {
      setError(result.error || 'Failed to create doc')
    }
  }, [state.selectedProjectPath, title, dispatch, navigate])

  const moveToNextField = useCallback(() => {
    const currentIndex = FIELDS.indexOf(activeField)
    if (currentIndex < FIELDS.length - 1) {
      setActiveField(FIELDS[currentIndex + 1])
    }
  }, [activeField])

  const moveToPrevField = useCallback(() => {
    const currentIndex = FIELDS.indexOf(activeField)
    if (currentIndex > 0) {
      setActiveField(FIELDS[currentIndex - 1])
    }
  }, [activeField])

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

    // Navigate between fields with Tab/Shift+Tab
    if (event.name === 'tab') {
      if (event.shift) {
        moveToPrevField()
      } else {
        moveToNextField()
      }
      return
    }

    // Text input is handled by native <input> and <textarea> components
  })

  // eslint-disable-next-line no-optional-chaining/no-optional-chaining
  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="New Doc">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isSubmitting) {
    return (
      <MainPanel title={`New Doc - ${projectName}`}>
        <text fg="cyan">Creating doc...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`New Doc - ${projectName}`}>
      <box flexDirection="column" flexGrow={1}>
        {/* Instructions */}
        <box marginBottom={1}>
          <text fg="gray">
            Tab: next field | Shift+Tab: prev | Ctrl+S: save | Esc: cancel
          </text>
        </box>

        {/* Error message */}
        {error && (
          <box marginBottom={1}>
            <text fg="red">{error}</text>
          </box>
        )}

        {/* Title field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'title' ? 'cyan' : 'white'}>
            <b>Title {activeField === 'title' ? '▸' : ' '}</b>
          </text>
          <box
            paddingLeft={2}
            borderStyle={activeField === 'title' ? 'single' : undefined}
          >
            <FormInput
              ref={titleInputRef}
              value={title}
              focused={activeField === 'title'}
              placeholder="Enter document title..."
              onInput={setTitle}
            />
          </box>
          <box paddingLeft={2}>
            <text fg="gray">Slug will be auto-generated from title</text>
          </box>
        </box>

        {/* Content field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'content' ? 'cyan' : 'white'}>
            <b>Content (Markdown) {activeField === 'content' ? '▸' : ' '}</b>
          </text>
          <box
            paddingLeft={2}
            borderStyle={activeField === 'content' ? 'single' : undefined}
          >
            <FormTextarea
              ref={contentRef}
              focused={activeField === 'content'}
              placeholder="Enter markdown content..."
              height={10}
            />
          </box>
        </box>

        {/* Submit hint */}
        <box marginTop={1}>
          <text fg="green">Press Ctrl+S to create doc</text>
        </box>
      </box>
    </MainPanel>
  )
}
