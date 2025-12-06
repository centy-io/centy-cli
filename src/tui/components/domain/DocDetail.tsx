import { useEffect, useRef } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useDocs } from '../../hooks/useDocs.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'

export function DocDetail() {
  const { selectedDocSlug, selectedDoc, isLoadingDoc, loadDoc } = useDocs()
  const { goBack } = useNavigation()
  const { state } = useAppState()
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

  useEffect(() => {
    if (selectedDocSlug && !selectedDoc) {
      loadDoc(selectedDocSlug)
    }
  }, [selectedDocSlug, selectedDoc, loadDoc])

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
      <MainPanel title="Doc">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (!selectedDocSlug) {
    return (
      <MainPanel title="Doc">
        <text fg="gray">No doc selected.</text>
      </MainPanel>
    )
  }

  if (isLoadingDoc || !selectedDoc) {
    return (
      <MainPanel title="Doc">
        <text fg="gray">Loading doc...</text>
      </MainPanel>
    )
  }

  const createdDate = new Date(selectedDoc.metadata.createdAt).toLocaleString()
  const updatedDate = new Date(selectedDoc.metadata.updatedAt).toLocaleString()

  return (
    <MainPanel title={selectedDoc.title}>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        <box flexDirection="column">
          {/* Metadata */}
          <box flexDirection="row" marginBottom={1}>
            <text fg="gray">Slug: </text>
            <text fg="cyan">{selectedDoc.slug}</text>
          </box>
          <box flexDirection="row">
            <text fg="gray">Created: </text>
            <text>{createdDate}</text>
          </box>
          <box flexDirection="row" marginBottom={1}>
            <text fg="gray">Updated: </text>
            <text>{updatedDate}</text>
          </box>

          {/* Separator */}
          <box marginBottom={1}>
            <text fg="gray">{'─'.repeat(40)}</text>
          </box>

          {/* Content */}
          <box flexDirection="column">
            {selectedDoc.content.split('\n').map((line, index) => (
              <text key={index}>{line || ' '}</text>
            ))}
          </box>
        </box>
      </scrollbox>
    </MainPanel>
  )
}
