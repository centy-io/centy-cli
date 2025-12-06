import { useState, useRef, useEffect } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useAssets } from '../../hooks/useAssets.js'
import { useAppState } from '../../state/app-state.js'
import type { Asset } from '../../../daemon/types.js'

const ITEM_HEIGHT = 2

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface AssetItemProps {
  asset: Asset
  isSelected: boolean
}

function AssetItem({ asset, isSelected }: AssetItemProps) {
  const createdDate = new Date(asset.createdAt).toLocaleDateString()

  return (
    <box height={ITEM_HEIGHT} flexDirection="column">
      <box flexDirection="row">
        <text bg={isSelected ? 'gray' : undefined}>
          {isSelected ? (
            <b>
              {'>'} {asset.filename}
            </b>
          ) : (
            `  ${asset.filename}`
          )}
        </text>
        {asset.isShared && <text fg="cyan"> [shared]</text>}
      </box>
      <box flexDirection="row" paddingLeft={4}>
        <text fg="gray">{formatFileSize(asset.size)}</text>
        <text fg="gray"> | {asset.mimeType}</text>
        <text fg="gray"> | {createdDate}</text>
      </box>
    </box>
  )
}

export function AssetList() {
  const { assets, isLoading } = useAssets()
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
      setSelectedIndex((prev: number) => Math.min(prev + 1, assets.length - 1))
    } else if (event.name === 'k' || event.name === 'up') {
      setSelectedIndex((prev: number) => Math.max(prev - 1, 0))
    }
  })

  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Assets">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Assets - ${projectName}`}>
        <text fg="gray">Loading assets...</text>
      </MainPanel>
    )
  }

  if (assets.length === 0) {
    return (
      <MainPanel title={`Assets - ${projectName}`}>
        <text fg="gray">No assets found.</text>
        <text fg="gray">
          Assets can be attached to issues or shared across the project.
        </text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`Assets - ${projectName}`}>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        {assets.map((asset: Asset, index: number) => (
          <AssetItem
            key={asset.filename}
            asset={asset}
            isSelected={index === selectedIndex}
          />
        ))}
      </scrollbox>
    </MainPanel>
  )
}
