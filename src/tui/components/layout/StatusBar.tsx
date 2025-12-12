/* eslint-disable custom/jsx-classname-required */
interface Shortcut {
  key: string
  label: string
}

interface StatusBarProps {
  shortcuts: Shortcut[]
  error?: string | null
  copyMessage?: string | null
}

export function StatusBar({ shortcuts, error, copyMessage }: StatusBarProps) {
  if (error) {
    return (
      <box height={1} width="100%">
        <text fg="red">{error}</text>
      </box>
    )
  }

  return (
    <box height={1} width="100%" flexDirection="row" gap={2}>
      {copyMessage && (
        <box flexDirection="row">
          <text fg="green">
            <b>{copyMessage}</b>
          </text>
          <text fg="gray"> | </text>
        </box>
      )}
      {shortcuts.map((shortcut, index) => (
        <box key={index} flexDirection="row">
          <text fg="yellow">
            <b>{shortcut.key}</b>
          </text>
          <text>: {shortcut.label}</text>
        </box>
      ))}
    </box>
  )
}
