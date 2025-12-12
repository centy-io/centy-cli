/* eslint-disable custom/jsx-classname-required */
import type { ReactNode } from 'react'

interface MainPanelProps {
  title: string
  children: ReactNode
}

export function MainPanel({ title, children }: MainPanelProps) {
  return (
    <box flexGrow={1} flexDirection="column" borderStyle="single">
      <box height={1} justifyContent="center">
        <text>
          <b>{title}</b>
        </text>
      </box>
      <box
        flexGrow={1}
        flexDirection="column"
        paddingTop={1}
        paddingLeft={1}
        paddingRight={1}
      >
        {children}
      </box>
    </box>
  )
}
