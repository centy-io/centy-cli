import { useState, useRef, useEffect } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useIssues } from '../../hooks/useIssues.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import type { Issue } from '../../../daemon/types.js'

const ITEM_HEIGHT = 1

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
  const { state } = useAppState()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

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
      setSelectedIndex((prev: number) => Math.min(prev + 1, issues.length - 1))
    } else if (event.name === 'k' || event.name === 'up') {
      setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
    } else if (event.name === 'return') {
      const issue = issues[selectedIndex]
      if (issue) {
        selectIssue(issue.id)
        navigate('issue-detail', { issueId: issue.id })
      }
    }
  })

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

  if (issues.length === 0) {
    return (
      <MainPanel title={`Issues - ${projectName}`}>
        <text fg="gray">No issues found.</text>
        <text fg="gray">Press `n` to create a new issue.</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`Issues - ${projectName}`}>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        {issues.map((issue: Issue, index: number) => {
          const isSelected = index === selectedIndex
          const priorityColor = getPriorityColor(issue.metadata.priority)
          const priorityLabel = getPriorityLabel(
            issue.metadata.priority,
            issue.metadata.priorityLabel
          )

          return (
            <box key={issue.id} height={ITEM_HEIGHT} flexDirection="row">
              <text bg={isSelected ? 'gray' : undefined}>
                {isSelected ? <b>{'>'}</b> : ' '}
              </text>
              <text fg="cyan">#{issue.displayNumber}</text>
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
