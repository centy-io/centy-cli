import { useState, useCallback } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import { useConfig } from '../../hooks/useConfig.js'
import { daemonService } from '../../services/daemon-service.js'

type FormField = 'title' | 'description' | 'priority'

const FIELDS: FormField[] = ['title', 'description', 'priority']

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

export function IssueCreate() {
  const { goBack, navigate } = useNavigation()
  const { state, dispatch } = useAppState()
  const { config } = useConfig()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(3) // Default to low
  const [activeField, setActiveField] = useState<FormField>('title')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const priorityLevels = config?.priorityLevels ?? 3

  const handleSubmit = useCallback(async () => {
    if (!state.selectedProjectPath) return
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await daemonService.createIssue(state.selectedProjectPath, {
      title: title.trim(),
      description: description.trim(),
      priority,
    })

    setIsSubmitting(false)

    if (result.success) {
      // Refresh issues list and navigate back
      dispatch({ type: 'SET_ISSUES', issues: [] }) // Clear to force reload
      navigate('issues')
    } else {
      setError(result.error || 'Failed to create issue')
    }
  }, [
    state.selectedProjectPath,
    title,
    description,
    priority,
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
      if (event.name === 'up' || event.name === 'k') {
        cyclePriority('up')
      } else if (event.name === 'down' || event.name === 'j') {
        cyclePriority('down')
      } else if (event.name === 'left' || event.name === 'h') {
        cyclePriority('up')
      } else if (event.name === 'right' || event.name === 'l') {
        cyclePriority('down')
      }
    } else if (activeField === 'title' || activeField === 'description') {
      // Handle text input
      if (event.name === 'backspace') {
        if (activeField === 'title') {
          setTitle(prev => prev.slice(0, -1))
        } else {
          setDescription(prev => prev.slice(0, -1))
        }
      } else if (event.name === 'return') {
        if (activeField === 'description') {
          setDescription(prev => prev + '\n')
        } else {
          moveToNextField()
        }
      } else if (event.name === 'space') {
        if (activeField === 'title') {
          setTitle(prev => prev + ' ')
        } else {
          setDescription(prev => prev + ' ')
        }
      } else if (event.name.length === 1 && !event.ctrl && !event.meta) {
        if (activeField === 'title') {
          setTitle(prev => prev + event.name)
        } else {
          setDescription(prev => prev + event.name)
        }
      }
    }
  })

  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="New Issue">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isSubmitting) {
    return (
      <MainPanel title={`New Issue - ${projectName}`}>
        <text fg="cyan">Creating issue...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`New Issue - ${projectName}`}>
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
            height={5}
          >
            <text>
              {description || (activeField === 'description' ? '' : '')}
            </text>
            {activeField === 'description' && <text fg="cyan">_</text>}
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

        {/* Submit hint */}
        <box marginTop={1}>
          <text fg="green">Press Ctrl+S to create issue</text>
        </box>
      </box>
    </MainPanel>
  )
}
