import { useKeyboard } from '@opentui/react'
import type { KeyEvent } from '@opentui/core'
import { Header } from './components/layout/Header.js'
import { Sidebar } from './components/layout/Sidebar.js'
import { StatusBar } from './components/layout/StatusBar.js'
import { ProjectList } from './components/domain/ProjectList.js'
import { IssueList } from './components/domain/IssueList.js'
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
    'issue-detail': [],
    'issue-create': [],
    docs: [],
    'doc-detail': [],
    'doc-create': [],
    assets: [],
    config: [],
    daemon: [],
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
    case 'docs':
      return (
        <MainPanel title="Docs">
          <text fg="gray">Docs view coming soon...</text>
        </MainPanel>
      )
    case 'assets':
      return (
        <MainPanel title="Assets">
          <text fg="gray">Assets view coming soon...</text>
        </MainPanel>
      )
    case 'config':
      return (
        <MainPanel title="Config">
          <text fg="gray">Config view coming soon...</text>
        </MainPanel>
      )
    case 'daemon':
      return <DaemonPanel />
    default:
      return <ProjectList />
  }
}
