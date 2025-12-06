import type { ViewId } from '../../types/views.js'
import { VIEW_LABELS } from '../../types/views.js'

interface SidebarProps {
  currentView: ViewId
  selectedIndex: number
  visibleViews: ViewId[]
  onNavigate: (view: ViewId) => void
}

export function Sidebar({
  currentView,
  selectedIndex,
  visibleViews,
}: SidebarProps) {
  return (
    <box width={20} flexDirection="column" borderStyle="single">
      <box height={1} justifyContent="center">
        <text>
          <b>Navigation</b>
        </text>
      </box>
      <box flexDirection="column" paddingTop={1}>
        {visibleViews.map((view, index) => {
          const isSelected = index === selectedIndex
          const isCurrent = view === currentView
          const label = `${isSelected ? '>' : ' '} ${VIEW_LABELS[view]}`

          return (
            <box key={view} height={1}>
              <text
                fg={isCurrent ? 'cyan' : isSelected ? 'white' : 'gray'}
                bg={isSelected ? 'gray' : undefined}
              >
                {isCurrent ? <b>{label}</b> : label}
              </text>
            </box>
          )
        })}
      </box>
    </box>
  )
}
