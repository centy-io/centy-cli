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
import type { PullRequest } from '../../../daemon/types.js'
import { FormInput, FormTextarea } from '../form/index.js'

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
  const { viewParams, goBack, navigateReplace } = useNavigation()
  const { state, dispatch } = useAppState()
  const { config } = useConfig()

  const [pr, setPr] = useState<PullRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [initialDescription, setInitialDescription] = useState('')
  const [sourceBranch, setSourceBranch] = useState('')
  const [targetBranch, setTargetBranch] = useState('')
  const [priority, setPriority] = useState(3)
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('draft')
  const [activeField, setActiveField] = useState<FormField>('title')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleInputRef = useRef<InputRenderable>(null)
  const descriptionRef = useRef<TextareaRenderable>(null)
  const sourceBranchRef = useRef<InputRenderable>(null)
  const targetBranchRef = useRef<InputRenderable>(null)

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
      setInitialDescription(loadedPr.description || '')
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

    // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
    const descriptionText = descriptionRef.current?.plainText ?? ''

    const result = await daemonService.updatePr(
      state.selectedProjectPath,
      pr.id,
      {
        title: title.trim(),
        description: descriptionText.trim(),
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
      navigateReplace('pr-detail', { prId: pr.id })
    } else {
      setError(result.error || 'Failed to update PR')
    }
  }, [
    state.selectedProjectPath,
    pr,
    title,
    sourceBranch,
    targetBranch,
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

    // Handle priority field with arrow keys
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
    }

    // Text input is handled by native <input> and <textarea> components
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
            <FormInput
              ref={titleInputRef}
              value={title}
              focused={activeField === 'title'}
              placeholder="Enter PR title..."
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
              height={3}
            />
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
            <FormInput
              ref={sourceBranchRef}
              value={sourceBranch}
              focused={activeField === 'sourceBranch'}
              placeholder="feature/my-branch"
              onInput={setSourceBranch}
            />
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
            <FormInput
              ref={targetBranchRef}
              value={targetBranch}
              focused={activeField === 'targetBranch'}
              placeholder="main"
              onInput={setTargetBranch}
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
        </box>

        {/* Submit hint */}
        <box marginTop={1}>
          <text fg="green">Press Ctrl+S to save changes</text>
        </box>
      </box>
    </MainPanel>
  )
}
