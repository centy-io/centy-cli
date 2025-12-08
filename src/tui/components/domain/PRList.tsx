import { useState, useRef, useEffect, useMemo } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { usePullRequests } from '../../hooks/usePullRequests.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import {
  useAppState,
  PR_SORT_FIELD_LABELS,
  type PrSortField,
} from '../../state/app-state.js'
import type { PullRequest } from '../../../daemon/types.js'
import { savePrSortConfig } from '../../utils/local-config.js'

const ITEM_HEIGHT = 1

const SORT_FIELDS: PrSortField[] = [
  'priority',
  'displayNumber',
  'createdAt',
  'updatedAt',
  'status',
]

function sortPrs(
  prs: PullRequest[],
  field: PrSortField,
  direction: 'asc' | 'desc'
): PullRequest[] {
  const sorted = [...prs].sort((a, b) => {
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
    default:
      return 'gray'
  }
}

export function PRList() {
  const { prs, isLoading, selectPr } = usePullRequests()
  const { navigate } = useNavigation()
  const { state, dispatch } = useAppState()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

  const { prSort } = state

  // Filter PRs: hide merged/closed by default unless showAll is true
  const filteredPrs = showAll
    ? prs
    : prs.filter(
        (pr: PullRequest) =>
          pr.metadata.status !== 'merged' && pr.metadata.status !== 'closed'
      )

  // Sort filtered PRs based on current sort configuration
  const sortedPrs = useMemo(
    () => sortPrs(filteredPrs, prSort.field, prSort.direction),
    [filteredPrs, prSort.field, prSort.direction]
  )

  // Cycle to next sort field
  const cycleSortField = () => {
    const currentIndex = SORT_FIELDS.indexOf(prSort.field)
    const nextIndex = (currentIndex + 1) % SORT_FIELDS.length
    const newSort = { ...prSort, field: SORT_FIELDS[nextIndex] }
    dispatch({ type: 'SET_PR_SORT', sort: newSort })
    savePrSortConfig(newSort)
    setSelectedIndex(0) // Reset selection when changing sort
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    const newSort = {
      ...prSort,
      direction: prSort.direction === 'asc' ? 'desc' : 'asc',
    } as const
    dispatch({ type: 'SET_PR_SORT', sort: newSort })
    savePrSortConfig(newSort)
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
        Math.min(prev + 1, sortedPrs.length - 1)
      )
    } else if (event.name === 'k' || event.name === 'up') {
      setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
    } else if (event.name === 'return') {
      const pr = sortedPrs[selectedIndex]
      if (pr) {
        selectPr(pr.id)
        navigate('pr-detail', { prId: pr.id })
      }
    } else if (event.name === 'n') {
      navigate('pr-create')
    } else if (event.name === 'a') {
      setShowAll(prev => !prev)
      setSelectedIndex(0) // Reset selection when toggling filter
    } else if (event.name === 's') {
      cycleSortField() // Cycle through sort fields
    } else if (event.name === 'S') {
      toggleSortDirection() // Toggle sort direction
    }
  })

  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Pull Requests">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Pull Requests - ${projectName}`}>
        <text fg="gray">Loading PRs...</text>
      </MainPanel>
    )
  }

  if (sortedPrs.length === 0) {
    const hasHiddenPrs = prs.length > 0 && !showAll
    return (
      <MainPanel title={`Pull Requests - ${projectName}`}>
        <text fg="gray">
          {hasHiddenPrs
            ? 'No open PRs. Press `a` to show all PRs.'
            : 'No PRs found.'}
        </text>
        <text fg="gray">Press `n` to create a new PR.</text>
      </MainPanel>
    )
  }

  const hiddenCount = prs.filter(
    (pr: PullRequest) =>
      pr.metadata.status === 'merged' || pr.metadata.status === 'closed'
  ).length

  const sortLabel = `Sort: ${PR_SORT_FIELD_LABELS[prSort.field]} ${prSort.direction === 'asc' ? '↑' : '↓'}`
  const filterLabel =
    hiddenCount > 0
      ? showAll
        ? `(${hiddenCount} merged/closed)`
        : `(hiding ${hiddenCount} merged/closed)`
      : null

  return (
    <MainPanel title={`Pull Requests - ${projectName}`}>
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
        {sortedPrs.map((pr: PullRequest, index: number) => {
          const isSelected = index === selectedIndex
          const priorityColor = getPriorityColor(pr.metadata.priority)
          const priorityLabel = getPriorityLabel(
            pr.metadata.priority,
            pr.metadata.priorityLabel
          )
          const statusColor = getStatusColor(pr.metadata.status)

          return (
            <box key={pr.id} height={ITEM_HEIGHT} flexDirection="row">
              <text bg={isSelected ? 'gray' : undefined}>
                {isSelected ? <b>{'>'}</b> : ' '}
              </text>
              <text fg="cyan">#{String(pr.displayNumber)}</text>
              <text> </text>
              <text fg={priorityColor}>[{priorityLabel}]</text>
              <text> </text>
              <text fg={statusColor}>[{pr.metadata.status}]</text>
              <text> </text>
              <text bg={isSelected ? 'gray' : undefined}>{pr.title}</text>
              <text fg="gray">
                {' '}
                ({pr.metadata.sourceBranch} → {pr.metadata.targetBranch})
              </text>
            </box>
          )
        })}
      </scrollbox>
    </MainPanel>
  )
}
