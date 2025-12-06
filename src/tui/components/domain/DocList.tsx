import { useState, useRef, useEffect } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useDocs } from '../../hooks/useDocs.js'
import { useNavigation } from '../../hooks/useNavigation.js'
import { useAppState } from '../../state/app-state.js'
import type { Doc } from '../../../daemon/types.js'

const ITEM_HEIGHT = 2

interface DocItemProps {
  doc: Doc
  isSelected: boolean
}

function DocItem({ doc, isSelected }: DocItemProps) {
  const updatedDate = new Date(doc.metadata.updatedAt).toLocaleDateString()

  return (
    <box height={ITEM_HEIGHT} flexDirection="column">
      <box flexDirection="row">
        <text bg={isSelected ? 'gray' : undefined}>
          {isSelected ? (
            <b>
              {'>'} {doc.title}
            </b>
          ) : (
            `  ${doc.title}`
          )}
        </text>
      </box>
      <box flexDirection="row" paddingLeft={4}>
        <text fg="gray">{doc.slug}</text>
        <text fg="gray"> | Updated: {updatedDate}</text>
      </box>
    </box>
  )
}

export function DocList() {
  const { docs, isLoading, selectDoc } = useDocs()
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
      setSelectedIndex((prev: number) => Math.min(prev + 1, docs.length - 1))
    } else if (event.name === 'k' || event.name === 'up') {
      setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
    } else if (event.name === 'return') {
      const doc = docs[selectedIndex]
      if (doc) {
        selectDoc(doc.slug)
        navigate('doc-detail', { docSlug: doc.slug })
      }
    }
  })

  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Docs">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Docs - ${projectName}`}>
        <text fg="gray">Loading docs...</text>
      </MainPanel>
    )
  }

  if (docs.length === 0) {
    return (
      <MainPanel title={`Docs - ${projectName}`}>
        <text fg="gray">No docs found.</text>
        <text fg="gray">Use `centy create doc` to create documentation.</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`Docs - ${projectName}`}>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        {docs.map((doc: Doc, index: number) => (
          <DocItem
            key={doc.slug}
            doc={doc}
            isSelected={index === selectedIndex}
          />
        ))}
      </scrollbox>
    </MainPanel>
  )
}
