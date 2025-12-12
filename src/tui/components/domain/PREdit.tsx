/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines-per-function, max-lines */

import { useState, useCallback, useEffect } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import { useConfig } from '../../hooks/useConfig.js'
import { daemonService } from '../../services/daemon-service.js'
import type { PullRequest } from '../../../daemon/types.js'

type FormField =
  | 'title'
  | 'description'
  | 'sourceBranch'
  | 'targetBranch'
  | 'priority'
  | 'status'

const FIELDS: FormField[] = [
  'title',
  'description',
  'sourceBranch',
  'targetBranch',
  'priority',
  'status',
]

const STATUS_OPTIONS = ['draft', 'open', 'merged', 'closed'] as const

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
  switch (status) {
    case 'draft':
      return 'gray'
    case 'open':
      return 'blue'
    case 'merged':
      return 'magenta'
    case 'closed':
      return 'red'
    // eslint-disable-next-line no-restricted-syntax
    default:
      return 'gray'
  }
}

export function PREdit() {
  const { viewParams, goBack, navigate } = useNavigation()
  const { state, dispatch } = useAppState()
  const { config } = useConfig()

  const [pr, setPr] = useState<PullRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sourceBranch, setSourceBranch] = useState('')
  const [targetBranch, setTargetBranch] = useState('')
  const [priority, setPriority] = useState(3)
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('draft')
  const [activeField, setActiveField] = useState<FormField>('title')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
  const priorityLevels = config?.priorityLevels ?? 3

  // Load PR data
  const loadPr = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return
    const prId = viewParams.prId || state.selectedPrId
    if (!prId) return

    setIsLoading(true)
    const result = await daemonService.getPr(state.selectedProjectPath, prId)
    setIsLoading(false)

    if (result.success && result.data) {
      const loadedPr = result.data
      setPr(loadedPr)
      setTitle(loadedPr.title)
      setDescription(loadedPr.description || '')
      setSourceBranch(loadedPr.metadata.sourceBranch)
      setTargetBranch(loadedPr.metadata.targetBranch)
      setPriority(loadedPr.metadata.priority)
      setStatus(
        // eslint-disable-next-line no-restricted-syntax
        (loadedPr.metadata.status as (typeof STATUS_OPTIONS)[number]) || 'draft'
      )
    } else if (result.error) {
      setError(result.error)
    }
  }, [
    state.daemonConnected,
    state.selectedProjectPath,
    state.selectedPrId,
    viewParams.prId,
  ])

  useEffect(() => {
    loadPr()
  }, [loadPr])

  const handleSubmit = useCallback(async () => {
    if (!state.selectedProjectPath || !pr) return
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await daemonService.updatePr(
      state.selectedProjectPath,
      pr.id,
      {
        title: title.trim(),
        description: description.trim(),
        sourceBranch: sourceBranch.trim(),
        targetBranch: targetBranch.trim(),
        priority,
        status,
      }
    )

    setIsSubmitting(false)

    if (result.success) {
      // Refresh PRs list and navigate back to detail
      dispatch({ type: 'SET_PRS', prs: [] }) // Clear to force reload
      navigate('pr-detail', { prId: pr.id })
    } else {
      setError(result.error || 'Failed to update PR')
    }
  }, [
    state.selectedProjectPath,
    pr,
    title,
    description,
    sourceBranch,
    targetBranch,
    priority,
    status,
    dispatch,
    navigate,
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

  const cycleStatus = useCallback((direction: 'up' | 'down') => {
    setStatus(prev => {
      const currentIndex = STATUS_OPTIONS.indexOf(prev)
      if (direction === 'up') {
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : STATUS_OPTIONS.length - 1
        // eslint-disable-next-line security/detect-object-injection
        return STATUS_OPTIONS[prevIndex]
      } else {
        const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length
        // eslint-disable-next-line security/detect-object-injection
        return STATUS_OPTIONS[nextIndex]
      }
    })
  }, [])

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

    // Handle input based on active field
    if (activeField === 'priority') {
      if (
        event.name === 'up' ||
        event.name === 'k' ||
        event.name === 'left' ||
        event.name === 'h'
      ) {
        cyclePriority('up')
      } else if (
        event.name === 'down' ||
        event.name === 'j' ||
        event.name === 'right' ||
        event.name === 'l'
      ) {
        cyclePriority('down')
      }
    } else if (activeField === 'status') {
      if (
        event.name === 'up' ||
        event.name === 'k' ||
        event.name === 'left' ||
        event.name === 'h'
      ) {
        cycleStatus('up')
      } else if (
        event.name === 'down' ||
        event.name === 'j' ||
        event.name === 'right' ||
        event.name === 'l'
      ) {
        cycleStatus('down')
      }
    } else {
      // Handle text input for title, description, sourceBranch, targetBranch
      const setters: Record<
        string,
        React.Dispatch<React.SetStateAction<string>>
      > = {
        title: setTitle,
        description: setDescription,
        sourceBranch: setSourceBranch,
        targetBranch: setTargetBranch,
      }
      // eslint-disable-next-line security/detect-object-injection
      const setter = setters[activeField]

      if (event.name === 'backspace') {
        setter(prev => prev.slice(0, -1))
      } else if (event.name === 'return') {
        if (activeField === 'description') {
          setter(prev => prev + '\n')
        } else {
          moveToNextField()
        }
      } else if (event.name === 'space') {
        setter(prev => prev + ' ')
      } else if (event.name.length === 1 && !event.ctrl && !event.meta) {
        const char = event.shift ? event.name.toUpperCase() : event.name
        setter(prev => prev + char)
      }
    }
  })

  // eslint-disable-next-line no-optional-chaining/no-optional-chaining
  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Edit PR">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Edit PR - ${projectName}`}>
        <text fg="cyan">Loading PR...</text>
      </MainPanel>
    )
  }

  if (!pr) {
    return (
      <MainPanel title={`Edit PR - ${projectName}`}>
        <text fg="red">PR not found.</text>
      </MainPanel>
    )
  }

  if (isSubmitting) {
    return (
      <MainPanel title={`Edit PR #${pr.displayNumber} - ${projectName}`}>
        <text fg="cyan">Saving changes...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`Edit PR #${pr.displayNumber} - ${projectName}`}>
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
            <text>{title || (activeField === 'title' ? '│' : '')}</text>
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'title' && <text fg="cyan">_</text>}
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
            height={3}
          >
            <text>
              {description || (activeField === 'description' ? '' : '')}
            </text>
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'description' && <text fg="cyan">_</text>}
          </box>
        </box>

        {/* Source Branch field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'sourceBranch' ? 'cyan' : 'white'}>
            <b>Source Branch {activeField === 'sourceBranch' ? '▸' : ' '}</b>
          </text>
          <box
            paddingLeft={2}
            borderStyle={activeField === 'sourceBranch' ? 'single' : undefined}
          >
            <text>
              {sourceBranch || (activeField === 'sourceBranch' ? '│' : '')}
            </text>
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'sourceBranch' && <text fg="cyan">_</text>}
          </box>
        </box>

        {/* Target Branch field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'targetBranch' ? 'cyan' : 'white'}>
            <b>Target Branch {activeField === 'targetBranch' ? '▸' : ' '}</b>
          </text>
          <box
            paddingLeft={2}
            borderStyle={activeField === 'targetBranch' ? 'single' : undefined}
          >
            <text>
              {targetBranch || (activeField === 'targetBranch' ? '│' : '')}
            </text>
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'targetBranch' && <text fg="cyan">_</text>}
          </box>
        </box>

        {/* Priority field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'priority' ? 'cyan' : 'white'}>
            <b>Priority {activeField === 'priority' ? '▸' : ' '}</b>
          </text>
          <box paddingLeft={2} flexDirection="row">
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'priority' && <text fg="gray">◀ </text>}
            <text fg={getPriorityColor(priority)}>
              {getPriorityLabel(priority)} ({priority}/{priorityLevels})
            </text>
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'priority' && <text fg="gray"> ▶</text>}
          </box>
        </box>

        {/* Status field */}
        <box flexDirection="column" marginBottom={1}>
          <text fg={activeField === 'status' ? 'cyan' : 'white'}>
            <b>Status {activeField === 'status' ? '▸' : ' '}</b>
          </text>
          <box paddingLeft={2} flexDirection="row">
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'status' && <text fg="gray">◀ </text>}
            <text fg={getStatusColor(status)}>{status}</text>
            // eslint-disable-next-line custom/jsx-classname-required
            {activeField === 'status' && <text fg="gray"> ▶</text>}
          </box>
        </box>

        {/* Submit hint */}
        <box marginTop={1}>
          <text fg="green">Press Ctrl+S to save changes</text>
        </box>
      </box>
    </MainPanel>
  )
}
