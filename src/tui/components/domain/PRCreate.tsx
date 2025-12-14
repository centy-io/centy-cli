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
import { useConfig } from '../../hooks/useConfig.js'
import { daemonService } from '../../services/daemon-service.js'
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

const STATUS_OPTIONS = ['draft', 'open'] as const

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
  return status === 'draft' ? 'gray' : 'blue'
}

export function PRCreate() {
  const { goBack, navigate } = useNavigation()
  const { state, dispatch } = useAppState()
  const { config } = useConfig()

  const [title, setTitle] = useState('')
  const [sourceBranch, setSourceBranch] = useState('')
  const [targetBranch, setTargetBranch] = useState('main')
  const [priority, setPriority] = useState(3) // Default to low
  const [status, setStatus] = useState<'draft' | 'open'>('draft')
  const [activeField, setActiveField] = useState<FormField>('title')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleInputRef = useRef<InputRenderable>(null)
  const descriptionRef = useRef<TextareaRenderable>(null)
  const sourceBranchRef = useRef<InputRenderable>(null)
  const targetBranchRef = useRef<InputRenderable>(null)

  // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
  const priorityLevels = config?.priorityLevels ?? 3

  const handleSubmit = useCallback(async () => {
    if (!state.selectedProjectPath) return
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
    const descriptionText = descriptionRef.current?.plainText ?? ''

    const result = await daemonService.createPr(state.selectedProjectPath, {
      title: title.trim(),
      description: descriptionText.trim(),
      sourceBranch: sourceBranch.trim() || undefined,
      targetBranch: targetBranch.trim() || undefined,
      priority,
      status,
    })

    setIsSubmitting(false)

    if (result.success) {
      // Refresh PRs list and navigate back
      dispatch({ type: 'SET_PRS', prs: [] }) // Clear to force reload
      navigate('prs')
    } else {
      setError(result.error || 'Failed to create PR')
    }
  }, [
    state.selectedProjectPath,
    title,
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

  const cycleStatus = useCallback(() => {
    setStatus(prev => (prev === 'draft' ? 'open' : 'draft'))
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
        event.name === 'down' ||
        event.name === 'j' ||
        event.name === 'left' ||
        event.name === 'h' ||
        event.name === 'right' ||
        event.name === 'l'
      ) {
        cycleStatus()
      }
    }

    // Text input is handled by native <input> and <textarea> components
  })

  // eslint-disable-next-line no-optional-chaining/no-optional-chaining
  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="New PR">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isSubmitting) {
    return (
      <MainPanel title={`New PR - ${projectName}`}>
        <text fg="cyan">Creating PR...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`New PR - ${projectName}`}>
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
            <text fg="gray"> (auto-detected if empty)</text>
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
          <text fg="green">Press Ctrl+S to create PR</text>
        </box>
      </box>
    </MainPanel>
  )
}
