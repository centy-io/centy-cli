/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines-per-function, max-lines */

import { useState, useRef, useEffect, useMemo } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useIssues } from '../../hooks/useIssues.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useClipboard } from '../../hooks/useClipboard.js'
import {
  useAppState,
  SORT_FIELD_LABELS,
  type IssueSortField,
} from '../../state/app-state.js'
import type { Issue } from '../../../daemon/types.js'
import { saveIssueSortConfig } from '../../utils/local-config.js'

const ITEM_HEIGHT = 1

const SORT_FIELDS: IssueSortField[] = [
  'priority',
  'displayNumber',
  'createdAt',
  'updatedAt',
  'status',
]

function sortIssues(
  issues: Issue[],
  field: IssueSortField,
  direction: 'asc' | 'desc'
): Issue[] {
  // eslint-disable-next-line no-restricted-syntax
  const sorted = [...issues].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'priority':
        comparison = a.metadata.priority - b.metadata.priority
        break
      case 'displayNumber':
        comparison = a.displayNumber - b.displayNumber
        break
      case 'createdAt':
        comparison =
          new Date(a.metadata.createdAt).getTime() -
          new Date(b.metadata.createdAt).getTime()
        break
      case 'updatedAt':
        comparison =
          new Date(a.metadata.updatedAt).getTime() -
          new Date(b.metadata.updatedAt).getTime()
        break
      case 'status':
        comparison = a.metadata.status.localeCompare(b.metadata.status)
        break
    }

    return direction === 'asc' ? comparison : -comparison
  })

  return sorted
}

function getPriorityColor(priority: number): string {
  if (priority === 1) return 'red'
  if (priority === 2) return 'yellow'
  return 'green'
}

function getPriorityLabel(priority: number, label?: string): string {
  if (label) return label
  if (priority === 1) return 'high'
  if (priority === 2) return 'med'
  return 'low'
}

export function IssueList() {
  const { issues, isLoading, selectIssue } = useIssues()
  const { navigate } = useNavigation()
  const { state, dispatch } = useAppState()
  const { copy } = useClipboard()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

  const { issueSort } = state

  // Filter issues: hide closed by default unless showAll is true
  const filteredIssues = showAll
    ? issues
    : issues.filter((issue: Issue) => issue.metadata.status !== 'closed')

  // Sort filtered issues based on current sort configuration
  const sortedIssues = useMemo(
    () => sortIssues(filteredIssues, issueSort.field, issueSort.direction),
    [filteredIssues, issueSort.field, issueSort.direction]
  )

  // Cycle to next sort field
  const cycleSortField = () => {
    const currentIndex = SORT_FIELDS.indexOf(issueSort.field)
    const nextIndex = (currentIndex + 1) % SORT_FIELDS.length
    // eslint-disable-next-line security/detect-object-injection
    const newSort = { ...issueSort, field: SORT_FIELDS[nextIndex] }
    dispatch({ type: 'SET_ISSUE_SORT', sort: newSort })
    saveIssueSortConfig(newSort)
    setSelectedIndex(0) // Reset selection when changing sort
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    const newSort = {
      ...issueSort,
      direction: issueSort.direction === 'asc' ? 'desc' : 'asc',
    } as const
    dispatch({ type: 'SET_ISSUE_SORT', sort: newSort })
    saveIssueSortConfig(newSort)
    setSelectedIndex(0) // Reset selection when changing sort
  }

  useEffect(() => {
    if (scrollBoxRef.current) {
      const targetScrollTop = selectedIndex * ITEM_HEIGHT
      const viewportHeight = scrollBoxRef.current.viewport.height
      const currentScrollTop = scrollBoxRef.current.scrollTop

      if (targetScrollTop < currentScrollTop) {
        scrollBoxRef.current.scrollTo(targetScrollTop)
      } else if (
        targetScrollTop + ITEM_HEIGHT >
        currentScrollTop + viewportHeight
      ) {
        scrollBoxRef.current.scrollTo(
          targetScrollTop - viewportHeight + ITEM_HEIGHT
        )
      }
    }
  }, [selectedIndex])

  useKeyboard((event: KeyEvent) => {
    if (event.name === 'j' || event.name === 'down') {
      setSelectedIndex((prev: number) =>
        Math.min(prev + 1, sortedIssues.length - 1)
      )
    } else if (event.name === 'k' || event.name === 'up') {
      setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
    } else if (event.name === 'return') {
      // eslint-disable-next-line security/detect-object-injection
      const issue = sortedIssues[selectedIndex]
      if (issue) {
        selectIssue(issue.id)
        navigate('issue-detail', { issueId: issue.id })
      }
    } else if (event.name === 'n') {
      navigate('issue-create')
    } else if (event.name === 'a') {
      setShowAll(prev => !prev)
      setSelectedIndex(0) // Reset selection when toggling filter
    } else if (event.name === 's') {
      cycleSortField() // Cycle through sort fields
    } else if (event.name === 'S') {
      toggleSortDirection() // Toggle sort direction
    } else if (event.name === 'y' && !event.shift && !event.ctrl) {
      // Copy selected issue title
      // eslint-disable-next-line security/detect-object-injection
      const issue = sortedIssues[selectedIndex]
      if (issue) {
        copy(`#${issue.displayNumber} ${issue.title}`, 'title')
      }
    } else if (event.name === 'y' && event.shift && !event.ctrl) {
      // Copy selected issue UUID
      // eslint-disable-next-line security/detect-object-injection
      const issue = sortedIssues[selectedIndex]
      if (issue) {
        copy(issue.id, 'UUID')
      }
    }
  })

  // eslint-disable-next-line no-optional-chaining/no-optional-chaining
  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Issues">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Issues - ${projectName}`}>
        <text fg="gray">Loading issues...</text>
      </MainPanel>
    )
  }

  if (sortedIssues.length === 0) {
    const hasClosedIssues = issues.length > 0 && !showAll
    return (
      <MainPanel title={`Issues - ${projectName}`}>
        <text fg="gray">
          {hasClosedIssues
            ? 'No open issues. Press `a` to show all issues.'
            : 'No issues found.'}
        </text>
        <text fg="gray">Press `n` to create a new issue.</text>
      </MainPanel>
    )
  }

  const closedCount = issues.filter(
    (i: Issue) => i.metadata.status === 'closed'
  ).length

  const sortLabel = `Sort: ${SORT_FIELD_LABELS[issueSort.field]} ${issueSort.direction === 'asc' ? '↑' : '↓'}`
  const filterLabel =
    closedCount > 0
      ? showAll
        ? `(${closedCount} closed)`
        : `(hiding ${closedCount} closed)`
      : null

  return (
    <MainPanel title={`Issues - ${projectName}`}>
      <box marginBottom={1} flexDirection="row">
        <text fg="cyan">{sortLabel}</text>
        <text fg="gray"> [s]cycle [S]dir</text>
        {filterLabel && (
          <>
            <text fg="gray"> | </text>
            <text fg="gray">{filterLabel}</text>
            <text fg="gray"> [a]toggle</text>
          </>
        )}
      </box>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        {sortedIssues.map((issue: Issue, index: number) => {
          const isSelected = index === selectedIndex
          const priorityColor = getPriorityColor(issue.metadata.priority)
          const priorityLabel = getPriorityLabel(
            issue.metadata.priority,
            issue.metadata.priorityLabel
          )

          return (
            <box key={issue.id} height={ITEM_HEIGHT} flexDirection="row">
              <text bg={isSelected ? 'gray' : undefined}>
                // eslint-disable-next-line custom/jsx-classname-required
                {isSelected ? <b>{'>'}</b> : ' '}
              </text>
              <text fg="cyan">#{String(issue.displayNumber)}</text>
              <text> </text>
              <text fg={priorityColor}>[{priorityLabel}]</text>
              <text> </text>
              <text fg="gray">[{issue.metadata.status}]</text>
              <text> </text>
              <text bg={isSelected ? 'gray' : undefined}>{issue.title}</text>
            </box>
          )
        })}
      </scrollbox>
    </MainPanel>
  )
}
