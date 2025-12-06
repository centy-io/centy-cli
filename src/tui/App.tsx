import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { Header } from './components/layout/Header.js'
import { Sidebar } from './components/layout/Sidebar.js'
import { StatusBar } from './components/layout/StatusBar.js'
import { ProjectList } from './components/domain/ProjectList.js'
import { IssueList } from './components/domain/IssueList.js'
import { IssueDetail } from './components/domain/IssueDetail.js'
import { DocList } from './components/domain/DocList.js'
import { DocDetail } from './components/domain/DocDetail.js'
import { AssetList } from './components/domain/AssetList.js'
import { ConfigPanel } from './components/domain/ConfigPanel.js'
import { DaemonPanel } from './components/domain/DaemonPanel.js'
import { MainPanel } from './components/layout/MainPanel.js'
import { useNavigation } from './hooks/useNavigation.js'
import { useDaemonConnection } from './hooks/useDaemonConnection.js'
import { useAppState } from './state/app-state.js'
import { SIDEBAR_VIEWS } from './types/views.js'
import type { ViewId } from './types/views.js'

interface AppProps {
  onExit: () => void
}

export function App({ onExit }: AppProps) {
  const { connected } = useDaemonConnection()
  const { currentView, sidebarIndex, navigate, selectSidebarItem } =
    useNavigation()
  const { state } = useAppState()

  // Global keyboard shortcuts
  useKeyboard((event: KeyEvent) => {
    // Quit
    if (event.name === 'q') {
      onExit()
      return
    }

    // Navigate sidebar with Tab or number keys
    if (event.name === 'tab') {
      const nextIndex = (sidebarIndex + 1) % SIDEBAR_VIEWS.length
      selectSidebarItem(nextIndex)
      navigate(SIDEBAR_VIEWS[nextIndex])
    }

    // Number keys for quick navigation
    const numKey = parseInt(event.name)
    if (numKey >= 1 && numKey <= SIDEBAR_VIEWS.length) {
      selectSidebarItem(numKey - 1)
      navigate(SIDEBAR_VIEWS[numKey - 1])
    }
  })

  const baseShortcuts = [
    { key: 'j/k', label: 'navigate' },
    { key: 'Enter', label: 'select' },
    { key: 'Tab', label: 'switch view' },
    { key: 'q', label: 'quit' },
  ]

  // View-specific shortcuts
  const viewShortcuts: Record<ViewId, Array<{ key: string; label: string }>> = {
    projects: [{ key: 'f', label: 'favorite' }],
    issues: [],
    'issue-detail': [
      { key: 'Esc', label: 'back' },
      { key: 'd/u', label: 'scroll' },
    ],
    'issue-create': [],
    docs: [],
    'doc-detail': [
      { key: 'Esc', label: 'back' },
      { key: 'd/u', label: 'scroll' },
    ],
    'doc-create': [],
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
    case 'issues':
      return <IssueList />
    case 'issue-detail':
      return <IssueDetail />
    case 'docs':
      return <DocList />
    case 'doc-detail':
      return <DocDetail />
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
            <text> Tab - Cycle through views</text>
            <text> 1-6 - Quick jump to view</text>
            <text> Esc/Backspace - Go back</text>
            <text> </text>
            <text fg="cyan">Global</text>
            <text> q - Quit</text>
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
