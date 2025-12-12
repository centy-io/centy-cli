/* eslint-disable custom/jsx-classname-required */
interface HeaderProps {
  title: string
  daemonConnected: boolean
}

export function Header({ title, daemonConnected }: HeaderProps) {
  const statusColor = daemonConnected ? 'green' : 'red'
  const statusText = daemonConnected ? 'Connected' : 'Disconnected'

  return (
    <box
      height={1}
      width="100%"
      flexDirection="row"
      justifyContent="space-between"
    >
      <text fg="cyan">
        <b>{title}</b>
      </text>
      <box flexDirection="row">
        <text fg={statusColor}>●</text>
        <text> Daemon: </text>
        <text fg={statusColor}>{statusText}</text>
      </box>
    </box>
  )
}
