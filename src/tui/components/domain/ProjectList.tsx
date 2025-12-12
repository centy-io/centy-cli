/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines-per-function, max-lines */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useProjects } from '../../hooks/useProjects.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import type { ProjectInfo } from '../../../daemon/types.js'

const ITEM_HEIGHT = 2

interface ProjectItemProps {
  project: ProjectInfo
  isSelected: boolean
}

function ProjectItem({ project, isSelected }: ProjectItemProps) {
  const name = project.name || project.path.split('/').pop() || project.path
  const favoriteIndicator = project.isFavorite ? '★ ' : '  '

  return (
    <box key={project.path} height={ITEM_HEIGHT} flexDirection="column">
      <box flexDirection="row">
        <text fg={project.isFavorite ? 'yellow' : undefined}>
          {favoriteIndicator}
        </text>
        <text bg={isSelected ? 'gray' : undefined}>
          {isSelected ? (
            <b>
              {'>'} {name}
            </b>
          ) : (
            ` ${name}`
          )}
        </text>
      </box>
      <box flexDirection="row" paddingLeft={5}>
        <text fg="gray">
          {String(project.issueCount)} issues, {String(project.docCount)} docs
        </text>
        // eslint-disable-next-line custom/jsx-classname-required
        {!project.initialized && <text fg="yellow"> (not initialized)</text>}
      </box>
    </box>
  )
}

export function ProjectList() {
  const {
    projects,
    isLoading,
    selectProject,
    toggleFavorite,
    toggleArchive,
    untrackProject,
  } = useProjects()
  const { navigate } = useNavigation()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [confirmUntrack, setConfirmUntrack] = useState<string | null>(null)
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

  // Sort projects: favorites first, then by last accessed
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return 0 // Keep original order (already sorted by last accessed from daemon)
    })
  }, [projects])

  // Keep selection on the same project after re-sorting
  useEffect(() => {
    if (selectedPath) {
      const newIndex = sortedProjects.findIndex(p => p.path === selectedPath)
      if (newIndex !== -1 && newIndex !== selectedIndex) {
        setSelectedIndex(newIndex)
      }
    }
  }, [sortedProjects, selectedPath, selectedIndex])

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

  const handleKeyboard = useCallback(
    (event: KeyEvent) => {
      // Handle confirmation dialog
      if (confirmUntrack) {
        if (event.name === 'y') {
          untrackProject(confirmUntrack)
          setConfirmUntrack(null)
        } else if (event.name === 'n' || event.name === 'escape') {
          setConfirmUntrack(null)
        }
        return
      }

      if (event.name === 'j' || event.name === 'down') {
        setSelectedIndex((prev: number) => {
          const newIndex = Math.min(prev + 1, sortedProjects.length - 1)
          // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining, security/detect-object-injection
          setSelectedPath(sortedProjects[newIndex]?.path ?? null)
          return newIndex
        })
      } else if (event.name === 'k' || event.name === 'up') {
        setSelectedIndex((prev: number) => {
          const newIndex = Math.max(prev - 1, 0)
          // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining, security/detect-object-injection
          setSelectedPath(sortedProjects[newIndex]?.path ?? null)
          return newIndex
        })
      } else if (event.name === 'return') {
        // eslint-disable-next-line security/detect-object-injection
        const project = sortedProjects[selectedIndex]
        if (project) {
          selectProject(project.path)
          navigate('issues')
        }
      } else if (event.name === 'f') {
        // eslint-disable-next-line security/detect-object-injection
        const project = sortedProjects[selectedIndex]
        if (project) {
          setSelectedPath(project.path)
          toggleFavorite(project.path, !project.isFavorite)
        }
      } else if (event.name === 'a') {
        // eslint-disable-next-line security/detect-object-injection
        const project = sortedProjects[selectedIndex]
        if (project) {
          toggleArchive(project.path, true)
        }
      } else if (event.name === 'x') {
        // eslint-disable-next-line security/detect-object-injection
        const project = sortedProjects[selectedIndex]
        if (project) {
          setConfirmUntrack(project.path)
        }
      } else if (event.name === 'n') {
        navigate('project-create')
      }
    },
    [
      confirmUntrack,
      untrackProject,
      sortedProjects,
      selectedIndex,
      selectProject,
      navigate,
      toggleFavorite,
      toggleArchive,
    ]
  )

  useKeyboard(handleKeyboard)

  if (isLoading) {
    return (
      <MainPanel title="Projects">
        <text fg="gray">Loading projects...</text>
      </MainPanel>
    )
  }

  if (sortedProjects.length === 0) {
    return (
      <MainPanel title="Projects">
        <text fg="gray">No projects found.</text>
        <text fg="gray">Press `n` to add a project.</text>
      </MainPanel>
    )
  }

  // Find project name for confirmation dialog
  const projectToUntrack = confirmUntrack
    ? sortedProjects.find(p => p.path === confirmUntrack)
    : null

  return (
    <MainPanel title="Projects">
      {confirmUntrack && projectToUntrack && (
        <box
          flexDirection="column"
          paddingTop={1}
          paddingBottom={1}
          borderStyle="single"
          borderColor="yellow"
        >
          <text fg="yellow">
            <b>Remove project from tracking?</b>
          </text>
          <text>"{projectToUntrack.name}"</text>
          <text fg="gray">
            (This only removes it from the list, not from disk)
          </text>
          <box flexDirection="row" paddingTop={1}>
            <text>Press </text>
            <text fg="green">
              <b>y</b>
            </text>
            <text> to confirm, </text>
            <text fg="red">
              <b>n</b>
            </text>
            <text> to cancel</text>
          </box>
        </box>
      )}
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        {sortedProjects.map((project: ProjectInfo, index: number) => (
          <ProjectItem
            key={project.path}
            project={project}
            isSelected={index === selectedIndex}
          />
        ))}
      </scrollbox>
    </MainPanel>
  )
}
