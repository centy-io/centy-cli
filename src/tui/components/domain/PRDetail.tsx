/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines-per-function, max-lines */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import { useClipboard } from '../../hooks/useClipboard.js'
import { daemonService } from '../../services/daemon-service.js'
import type { PullRequest } from '../../../daemon/types.js'

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

interface PRSectionProps {
  title: string
  children: React.ReactNode
}

function PRSection({ title, children }: PRSectionProps) {
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

export function PRDetail() {
  const { viewParams, goBack, navigate } = useNavigation()
  const { state, dispatch } = useAppState()
  const { copy } = useClipboard()
  const [pr, setPr] = useState<PullRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

  const loadPr = useCallback(async () => {
    if (!state.daemonConnected || !state.selectedProjectPath) return
    const prId = viewParams.prId || state.selectedPrId
    if (!prId) return

    setIsLoading(true)
    const result = await daemonService.getPr(state.selectedProjectPath, prId)
    setIsLoading(false)

    if (result.success && result.data) {
      setPr(result.data)
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', error: result.error })
    }
  }, [
    state.daemonConnected,
    state.selectedProjectPath,
    state.selectedPrId,
    viewParams.prId,
    dispatch,
  ])

  useEffect(() => {
    loadPr()
  }, [loadPr])

  useKeyboard((event: KeyEvent) => {
    if (event.name === 'escape' || event.name === 'backspace') {
      goBack()
    } else if (event.name === 'e') {
      // Edit PR
      const prId = viewParams.prId || state.selectedPrId
      if (prId) {
        navigate('pr-edit', { prId })
      }
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
    } else if (event.name === 'y' && !event.shift && !event.ctrl && pr) {
      // Copy title
      copy(`PR #${pr.displayNumber} ${pr.title}`, 'title')
    } else if (event.name === 'y' && event.shift && !event.ctrl && pr) {
      // Copy UUID
      copy(pr.id, 'UUID')
    } else if (event.name === 'y' && event.ctrl && pr) {
      // Copy description
      copy(pr.description || '', 'description')
    }
  })

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Pull Request">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading || !pr) {
    return (
      <MainPanel title="Pull Request">
        <text fg="gray">Loading PR...</text>
      </MainPanel>
    )
  }

  const createdDate = new Date(pr.metadata.createdAt).toLocaleString()
  const updatedDate = new Date(pr.metadata.updatedAt).toLocaleString()
  const priorityColor = getPriorityColor(pr.metadata.priority)
  const priorityLabel = getPriorityLabel(
    pr.metadata.priority,
    pr.metadata.priorityLabel
  )
  const statusColor = getStatusColor(pr.metadata.status)

  return (
    <MainPanel title={`PR #${pr.displayNumber} ${pr.title}`}>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        <box flexDirection="column">
          {/* Status and Priority */}
          <box flexDirection="row" marginBottom={1}>
            <text>Status: </text>
            <text fg={statusColor}>{pr.metadata.status}</text>
            <text> | Priority: </text>
            <text fg={priorityColor}>{priorityLabel}</text>
          </box>

          {/* UUID */}
          <box flexDirection="row" marginBottom={1}>
            <text fg="gray">UUID: </text>
            <text fg="gray">{pr.id}</text>
          </box>

          {/* Branches */}
          <PRSection title="Branches">
            <box flexDirection="row">
              <text fg="cyan">{pr.metadata.sourceBranch}</text>
              <text fg="gray"> → </text>
              <text fg="green">{pr.metadata.targetBranch}</text>
            </box>
          </PRSection>

          {/* Linked Issues */}
          {pr.metadata.linkedIssues.length > 0 && (
            <PRSection title="Linked Issues">
              {pr.metadata.linkedIssues.map((issueId, index) => (
                <text key={index} fg="yellow">
                  #{issueId}
                </text>
              ))}
            </PRSection>
          )}

          {/* Reviewers */}
          {pr.metadata.reviewers.length > 0 && (
            <PRSection title="Reviewers">
              {pr.metadata.reviewers.map((reviewer, index) => (
                <text key={index}>{reviewer}</text>
              ))}
            </PRSection>
          )}

          {/* Dates */}
          <PRSection title="Timeline">
            <box flexDirection="row">
              <text fg="gray">Created: </text>
              <text>{createdDate}</text>
            </box>
            <box flexDirection="row">
              <text fg="gray">Updated: </text>
              <text>{updatedDate}</text>
            </box>
            {pr.metadata.mergedAt && (
              <box flexDirection="row">
                <text fg="magenta">Merged: </text>
                <text>{new Date(pr.metadata.mergedAt).toLocaleString()}</text>
              </box>
            )}
            {pr.metadata.closedAt && (
              <box flexDirection="row">
                <text fg="red">Closed: </text>
                <text>{new Date(pr.metadata.closedAt).toLocaleString()}</text>
              </box>
            )}
          </PRSection>

          {/* Custom Fields */}
          {Object.keys(pr.metadata.customFields).length > 0 && (
            <PRSection title="Custom Fields">
              {Object.entries(pr.metadata.customFields).map(([key, value]) => (
                <box key={key} flexDirection="row">
                  <text fg="yellow">{key}: </text>
                  <text>{value}</text>
                </box>
              ))}
            </PRSection>
          )}

          {/* Separator */}
          <box marginBottom={1}>
            <text fg="gray">{'─'.repeat(40)}</text>
          </box>

          {/* Description */}
          <PRSection title="Description">
            {pr.description ? (
              pr.description
                .split('\n')
                .map((line, index) => <text key={index}>{line || ' '}</text>)
            ) : (
              <text fg="gray">No description provided.</text>
            )}
          </PRSection>
        </box>
      </scrollbox>
    </MainPanel>
  )
}
