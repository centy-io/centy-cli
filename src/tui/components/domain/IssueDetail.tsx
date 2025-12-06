import { useEffect, useRef, useState, useCallback } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import { daemonService } from '../../services/daemon-service.js'
import type { Issue } from '../../../daemon/types.js'

function getPriorityColor(priority: number): string {
  if (priority === 1) return 'red'
  if (priority === 2) return 'yellow'
  return 'green'
}

function getPriorityLabel(priority: number, label?: string): string {
  if (label) return label
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

interface IssueSectionProps {
  title: string
  children: React.ReactNode
}

function IssueSection({ title, children }: IssueSectionProps) {
  return (
    <box flexDirection="column" marginBottom={1}>
      <text fg="cyan">
        <b>{title}</b>
      </text>
      <box paddingLeft={2} flexDirection="column">
        {children}
      </box>
    </box>
  )
}

export function IssueDetail() {
  const { viewParams, goBack } = useNavigation()
  const { state, dispatch } = useAppState()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

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
      setIssue(result.data)
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [
    state.daemonConnected,
    state.selectedProjectPath,
    state.selectedIssueId,
    viewParams.issueId,
    dispatch,
  ])

  useEffect(() => {
    loadIssue()
  }, [loadIssue])

  useKeyboard((event: KeyEvent) => {
    if (event.name === 'escape' || event.name === 'backspace') {
      goBack()
    } else if (event.name === 'j' || event.name === 'down') {
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollBy(1)
      }
    } else if (event.name === 'k' || event.name === 'up') {
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollBy(-1)
      }
    } else if (event.name === 'pagedown' || event.name === 'd') {
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollBy(10)
      }
    } else if (event.name === 'pageup' || event.name === 'u') {
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollBy(-10)
      }
    }
  })

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Issue">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading || !issue) {
    return (
      <MainPanel title="Issue">
        <text fg="gray">Loading issue...</text>
      </MainPanel>
    )
  }

  const createdDate = new Date(issue.metadata.createdAt).toLocaleString()
  const updatedDate = new Date(issue.metadata.updatedAt).toLocaleString()
  const priorityColor = getPriorityColor(issue.metadata.priority)
  const priorityLabel = getPriorityLabel(
    issue.metadata.priority,
    issue.metadata.priorityLabel
  )
  const statusColor = getStatusColor(issue.metadata.status)

  return (
    <MainPanel title={`#${issue.displayNumber} ${issue.title}`}>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        <box flexDirection="column">
          {/* Status and Priority */}
          <box flexDirection="row" marginBottom={1}>
            <text>Status: </text>
            <text fg={statusColor}>{issue.metadata.status}</text>
            <text> | Priority: </text>
            <text fg={priorityColor}>{priorityLabel}</text>
          </box>

          {/* Dates */}
          <IssueSection title="Timeline">
            <box flexDirection="row">
              <text fg="gray">Created: </text>
              <text>{createdDate}</text>
            </box>
            <box flexDirection="row">
              <text fg="gray">Updated: </text>
              <text>{updatedDate}</text>
            </box>
          </IssueSection>

          {/* Custom Fields */}
          {Object.keys(issue.metadata.customFields).length > 0 && (
            <IssueSection title="Custom Fields">
              {Object.entries(issue.metadata.customFields).map(
                ([key, value]) => (
                  <box key={key} flexDirection="row">
                    <text fg="yellow">{key}: </text>
                    <text>{value}</text>
                  </box>
                )
              )}
            </IssueSection>
          )}

          {/* Separator */}
          <box marginBottom={1}>
            <text fg="gray">{'─'.repeat(40)}</text>
          </box>

          {/* Description */}
          <IssueSection title="Description">
            {issue.description ? (
              issue.description
                .split('\n')
                .map((line, index) => <text key={index}>{line || ' '}</text>)
            ) : (
              <text fg="gray">No description provided.</text>
            )}
          </IssueSection>
        </box>
      </scrollbox>
    </MainPanel>
  )
}
