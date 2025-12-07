import { useMemo } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { Header } from './components/layout/Header.js'
import { Sidebar } from './components/layout/Sidebar.js'
import { StatusBar } from './components/layout/StatusBar.js'
import { ProjectList } from './components/domain/ProjectList.js'
import { IssueList } from './components/domain/IssueList.js'
import { IssueDetail } from './components/domain/IssueDetail.js'
import { IssueCreate } from './components/domain/IssueCreate.js'
import { DocList } from './components/domain/DocList.js'
import { DocDetail } from './components/domain/DocDetail.js'
import { DocCreate } from './components/domain/DocCreate.js'
import { ProjectCreate } from './components/domain/ProjectCreate.js'
import { AssetList } from './components/domain/AssetList.js'
import { ConfigPanel } from './components/domain/ConfigPanel.js'
import { DaemonPanel } from './components/domain/DaemonPanel.js'
import { MainPanel } from './components/layout/MainPanel.js'
import { useNavigation } from './hooks/useNavigation.js'
import { useDaemonConnection } from './hooks/useDaemonConnection.js'
import { useAppState } from './state/app-state.js'
import { getVisibleSidebarViews } from './types/views.js'
import type { ViewId } from './types/views.js'

interface AppProps {
  onExit: () => void
}

export function App({ onExit }: AppProps) {
  const { connected } = useDaemonConnection()
  const { currentView, sidebarIndex, navigate, selectSidebarItem } =
    useNavigation()
  const { state } = useAppState()

  // Get visible sidebar views based on project selection
  const visibleViews = useMemo(
    () => getVisibleSidebarViews(!!state.selectedProjectPath),
    [state.selectedProjectPath]
  )

  // Views that handle their own keyboard input (forms)
  const isFormView =
    currentView === 'issue-create' ||
    currentView === 'doc-create' ||
    currentView === 'project-create'

  // Global keyboard shortcuts
  useKeyboard((event: KeyEvent) => {
    // Quit with 'q' or Ctrl-C (but not in form views where 'q' is valid input)
    if (event.name === 'q' && !isFormView) {
      onExit()
      return
    }
    if (event.ctrl && event.name === 'c') {
      onExit()
      return
    }

    // Skip sidebar navigation in form views - let forms handle Tab/arrows
    if (isFormView) {
      return
    }

    // Navigate sidebar with Tab, arrow keys, or number keys
    if (event.name === 'tab' || event.name === 'right') {
      const nextIndex = (sidebarIndex + 1) % visibleViews.length
      selectSidebarItem(nextIndex)
      navigate(visibleViews[nextIndex])
    }

    if (event.name === 'left') {
      const prevIndex =
        sidebarIndex > 0 ? sidebarIndex - 1 : visibleViews.length - 1
      selectSidebarItem(prevIndex)
      navigate(visibleViews[prevIndex])
    }

    // Number keys for quick navigation
    const numKey = parseInt(event.name)
    if (numKey >= 1 && numKey <= visibleViews.length) {
      selectSidebarItem(numKey - 1)
      navigate(visibleViews[numKey - 1])
    }
  })

  const baseShortcuts = [
    { key: 'j/k', label: 'navigate' },
    { key: 'Enter', label: 'select' },
    { key: '←/→', label: 'switch view' },
    { key: 'q/^C', label: 'quit' },
  ]

  // View-specific shortcuts
  const viewShortcuts: Record<ViewId, Array<{ key: string; label: string }>> = {
    projects: [
      { key: 'n', label: 'new' },
      { key: 'f', label: 'favorite' },
      { key: 'a', label: 'archive' },
      { key: 'x', label: 'remove' },
    ],
    'project-create': [
      { key: '^S', label: 'save' },
      { key: 'Esc', label: 'cancel' },
    ],
    issues: [{ key: 'n', label: 'new' }],
    'issue-detail': [
      { key: 'Esc', label: 'back' },
      { key: 'd/u', label: 'scroll' },
    ],
    'issue-create': [
      { key: 'Tab', label: 'next field' },
      { key: '^S', label: 'save' },
      { key: 'Esc', label: 'cancel' },
    ],
    docs: [{ key: 'n', label: 'new' }],
    'doc-detail': [
      { key: 'Esc', label: 'back' },
      { key: 'd/u', label: 'scroll' },
    ],
    'doc-create': [
      { key: 'Tab', label: 'next field' },
      { key: '^S', label: 'save' },
      { key: 'Esc', label: 'cancel' },
    ],
    assets: [],
    config: [],
    daemon: [
      { key: 's', label: 'shutdown' },
      { key: 'r', label: 'restart' },
      { key: 'c', label: 'check' },
    ],
    help: [],
  }

  const shortcuts = [...baseShortcuts, ...viewShortcuts[currentView]]

  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* Header */}
      <Header title="Centy" daemonConnected={connected} />

      {/* Main content area */}
      <box flexGrow={1} flexDirection="row">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          selectedIndex={sidebarIndex}
          visibleViews={visibleViews}
          onNavigate={navigate}
        />

        {/* Content */}
        {renderView(currentView)}
      </box>

      {/* Status bar */}
      <StatusBar shortcuts={shortcuts} error={state.error} />
    </box>
  )
}

function renderView(view: ViewId) {
  switch (view) {
    case 'projects':
      return <ProjectList />
    case 'project-create':
      return <ProjectCreate />
    case 'issues':
      return <IssueList />
    case 'issue-detail':
      return <IssueDetail />
    case 'issue-create':
      return <IssueCreate />
    case 'docs':
      return <DocList />
    case 'doc-detail':
      return <DocDetail />
    case 'doc-create':
      return <DocCreate />
    case 'assets':
      return <AssetList />
    case 'config':
      return <ConfigPanel />
    case 'daemon':
      return <DaemonPanel />
    case 'help':
      return (
        <MainPanel title="Help">
          <box flexDirection="column">
            <text>
              <b>Centy TUI Help</b>
            </text>
            <text> </text>
            <text fg="cyan">Navigation</text>
            <text> j/k or Up/Down - Move selection</text>
            <text> Enter - Select/open item</text>
            <text> ←/→ or Tab - Cycle through views</text>
            <text> 1-6 - Quick jump to view</text>
            <text> Esc/Backspace - Go back</text>
            <text> </text>
            <text fg="cyan">Global</text>
            <text> q or Ctrl-C - Quit</text>
            <text> </text>
            <text fg="cyan">Scrolling</text>
            <text> j/k - Scroll line by line</text>
            <text> d/u - Scroll page down/up</text>
          </box>
        </MainPanel>
      )
    default:
      return <ProjectList />
  }
}
