/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines-per-function, max-lines */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useKeyboard } from '@opentui/react'
import type {
  KeyEvent,
  InputRenderable,
  TextareaRenderable,
} from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import { useConfig } from '../../hooks/useConfig.js'
import { daemonService } from '../../services/daemon-service.js'
import type { Issue } from '../../../daemon/types.js'
import { FormInput, FormTextarea } from '../form/index.js'

type FormField = 'title' | 'description' | 'priority' | 'status'

const FIELDS: FormField[] = ['title', 'description', 'priority', 'status']

const DEFAULT_STATUSES = ['open', 'in-progress', 'done', 'closed']

function getPriorityColor(priority: number): string {
  if (priority === 1) return 'red'
  if (priority === 2) return 'yellow'
  return 'green'
}

function getPriorityLabel(priority: number): string {
  if (priority === 1) return 'High'
  if (priority === 2) return 'Medium'
  return 'Low'
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  if (statusLower === 'done' || statusLower === 'closed') return 'green'
  if (statusLower === 'in-progress' || statusLower === 'in_progress')
    return 'yellow'
  return 'gray'
}

export function IssueEdit() {
  const { viewParams, goBack, navigateReplace } = useNavigation()
  const { state, dispatch } = useAppState()
  const { config } = useConfig()

  const [issue, setIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [initialDescription, setInitialDescription] = useState('')
  const [priority, setPriority] = useState(3)
  const [status, setStatus] = useState('open')
  const [activeField, setActiveField] = useState<FormField>('title')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleInputRef = useRef<InputRenderable>(null)
  const descriptionRef = useRef<TextareaRenderable>(null)

  // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
  const priorityLevels = config?.priorityLevels ?? 3
  // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
  const statuses = config?.allowedStates ?? DEFAULT_STATUSES

  // Load issue data
  const loadIssue = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return
    const issueId = viewParams.issueId || state.selectedIssueId
    if (!issueId) return

    setIsLoading(true)
    const result = await daemonService.getIssue(
      state.selectedProjectPath,
      issueId
    )
    setIsLoading(false)

    if (result.success && result.data) {
      const loadedIssue = result.data
      setIssue(loadedIssue)
      setTitle(loadedIssue.title)
      setInitialDescription(loadedIssue.description || '')
      setPriority(loadedIssue.metadata.priority)
      setStatus(loadedIssue.metadata.status)
    } else if (result.error) {
      setError(result.error)
    }
  }, [
    state.daemonConnected,
    state.selectedProjectPath,
    state.selectedIssueId,
    viewParams.issueId,
  ])

  useEffect(() => {
    loadIssue()
  }, [loadIssue])

  const handleSubmit = useCallback(async () => {
    if (!state.selectedProjectPath || !issue) return
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
    const descriptionText = descriptionRef.current?.plainText ?? ''

    const result = await daemonService.updateIssue(
      state.selectedProjectPath,
      issue.id,
      {
        title: title.trim(),
        description: descriptionText.trim(),
        priority,
        status,
      }
    )

    setIsSubmitting(false)

    if (result.success) {
      // Refresh issues list and navigate back to detail
      dispatch({ type: 'SET_ISSUES', issues: [] }) // Clear to force reload
      navigateReplace('issue-detail', { issueId: issue.id })
    } else {
      setError(result.error || 'Failed to update issue')
    }
  }, [
    state.selectedProjectPath,
    issue,
    title,
    priority,
    status,
    dispatch,
    navigateReplace,
  ])

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

  const cyclePriority = useCallback(
    (direction: 'up' | 'down') => {
      if (direction === 'up') {
        setPriority(prev => (prev > 1 ? prev - 1 : priorityLevels))
      } else {
        setPriority(prev => (prev < priorityLevels ? prev + 1 : 1))
      }
    },
    [priorityLevels]
  )

  const cycleStatus = useCallback(
    (direction: 'up' | 'down') => {
      const currentIndex = statuses.indexOf(status)
      if (direction === 'up') {
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : statuses.length - 1
        // eslint-disable-next-line security/detect-object-injection
        setStatus(statuses[prevIndex])
      } else {
        const nextIndex = (currentIndex + 1) % statuses.length
        // eslint-disable-next-line security/detect-object-injection
        setStatus(statuses[nextIndex])
      }
    },
    [status, statuses]
  )

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

    // Handle priority field with arrow keys
    if (activeField === 'priority') {
      if (event.name === 'up' || event.name === 'k') {
        cyclePriority('up')
      } else if (event.name === 'down' || event.name === 'j') {
        cyclePriority('down')
      } else if (event.name === 'left' || event.name === 'h') {
        cyclePriority('up')
      } else if (event.name === 'right' || event.name === 'l') {
        cyclePriority('down')
      }
    } else if (activeField === 'status') {
      if (event.name === 'up' || event.name === 'k') {
        cycleStatus('up')
      } else if (event.name === 'down' || event.name === 'j') {
        cycleStatus('down')
      } else if (event.name === 'left' || event.name === 'h') {
        cycleStatus('up')
      } else if (event.name === 'right' || event.name === 'l') {
        cycleStatus('down')
      }
    }

    // Text input is handled by native <input> and <textarea> components
  })

  // eslint-disable-next-line no-optional-chaining/no-optional-chaining
  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Edit Issue">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Edit Issue - ${projectName}`}>
        <text fg="cyan">Loading issue...</text>
      </MainPanel>
    )
  }

  if (!issue) {
    return (
      <MainPanel title={`Edit Issue - ${projectName}`}>
        <text fg="red">Issue not found.</text>
      </MainPanel>
    )
  }

  if (isSubmitting) {
    return (
      <MainPanel title={`Edit Issue #${issue.displayNumber} - ${projectName}`}>
        <text fg="cyan">Saving changes...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`Edit Issue #${issue.displayNumber} - ${projectName}`}>
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
              placeholder="Enter issue title..."
              onInput={setTitle}
            />
          </box>
        </box>

        {/* Description field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'description' ? 'cyan' : 'white'}>
            <b>Description {activeField === 'description' ? '▸' : ' '}</b>
          </text>
          <box
            paddingLeft={2}
            borderStyle={activeField === 'description' ? 'single' : undefined}
          >
            <FormTextarea
              ref={descriptionRef}
              initialValue={initialDescription}
              focused={activeField === 'description'}
              placeholder="Enter description..."
              height={5}
            />
          </box>
        </box>

        {/* Priority field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'priority' ? 'cyan' : 'white'}>
            <b>Priority {activeField === 'priority' ? '▸' : ' '}</b>
          </text>
          <box paddingLeft={2} flexDirection="row">
            {activeField === 'priority' && <text fg="gray">◀ </text>}
            <text fg={getPriorityColor(priority)}>
              {getPriorityLabel(priority)} ({priority}/{priorityLevels})
            </text>
            {activeField === 'priority' && <text fg="gray"> ▶</text>}
          </box>
          {activeField === 'priority' && (
            <box paddingLeft={2}>
              <text fg="gray">Use arrow keys or h/l to change</text>
            </box>
          )}
        </box>

        {/* Status field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'status' ? 'cyan' : 'white'}>
            <b>Status {activeField === 'status' ? '▸' : ' '}</b>
          </text>
          <box paddingLeft={2} flexDirection="row">
            {activeField === 'status' && <text fg="gray">◀ </text>}
            <text fg={getStatusColor(status)}>{status}</text>
            {activeField === 'status' && <text fg="gray"> ▶</text>}
          </box>
          {activeField === 'status' && (
            <box paddingLeft={2}>
              <text fg="gray">Use arrow keys or h/l to change</text>
            </box>
          )}
        </box>

        {/* Submit hint */}
        <box marginTop={1}>
          <text fg="green">Press Ctrl+S to save changes</text>
        </box>
      </box>
    </MainPanel>
  )
}
