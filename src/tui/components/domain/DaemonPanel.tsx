/* eslint-disable custom/jsx-classname-required */
/* eslint-disable max-lines */

import { MainPanel } from '../layout/MainPanel.js'
import { useDaemonConnection } from '../../hooks/useDaemonConnection.js'
import { useDaemonInfo } from '../../hooks/useDaemonInfo.js'
import {
  useDaemonActions,
  type ActionState,
} from '../../hooks/useDaemonActions.js'
import { useAutostart } from '../../hooks/useAutostart.js'
import type { DaemonInfo } from '../../../daemon/types.js'

interface DaemonInfoDisplayProps {
  daemonInfo: DaemonInfo
}

function DaemonInfoDisplay({ daemonInfo }: DaemonInfoDisplayProps) {
  return (
    <>
      <box flexDirection="row">
        <text>Version: </text>
        <text fg="cyan">{daemonInfo.version}</text>
      </box>
      {daemonInfo.binaryPath && (
        <box flexDirection="row">
          <text>Binary: </text>
          <text fg="cyan">{daemonInfo.binaryPath}</text>
        </box>
      )}
      {daemonInfo.availableVersions.length > 0 && (
        <box flexDirection="column">
          <text fg="gray">Available versions:</text>
          <box paddingLeft={2}>
            <text fg="gray">{daemonInfo.availableVersions.join(', ')}</text>
          </box>
        </box>
      )}
    </>
  )
}

interface DaemonControlsProps {
  showAutostartToggle: boolean
  autostartEnabled: boolean | null
}

function DaemonControls({
  showAutostartToggle,
  autostartEnabled,
}: DaemonControlsProps) {
  return (
    <box marginTop={1} flexDirection="column">
      <text>
        <b>Controls</b>
      </text>
      <box paddingLeft={1} flexDirection="column">
        <text fg="gray">[s] Shutdown daemon</text>
        <text fg="gray">[r] Restart daemon</text>
        <text fg="gray">[c] Check connection</text>
        {showAutostartToggle && (
          <text fg="gray">
            [a] {autostartEnabled ? 'Disable' : 'Enable'} autostart on boot
          </text>
        )}
      </box>
    </box>
  )
}

interface ActionMessageProps {
  message: string
  actionState: ActionState
}

function ActionMessage({ message, actionState }: ActionMessageProps) {
  const color =
    actionState === 'confirming'
      ? 'yellow'
      : message.startsWith('Error')
        ? 'red'
        : 'green'

  return (
    <box marginTop={1}>
      <text fg={color}>{message}</text>
    </box>
  )
}

interface DisconnectedViewProps {
  actionMessage: string | null
}

function DisconnectedView({ actionMessage }: DisconnectedViewProps) {
  return (
    <MainPanel title="Daemon">
      <box flexDirection="column" gap={1}>
        <box flexDirection="row">
          <text>Status: </text>
          <text fg="red">Disconnected</text>
        </box>
        <text fg="gray">The daemon is not running or cannot be reached.</text>
        <box marginTop={1}>
          <text fg="gray">[c] Check connection</text>
        </box>
        {actionMessage && (
          <box marginTop={1}>
            <text fg="yellow">{actionMessage}</text>
          </box>
        )}
      </box>
    </MainPanel>
  )
}

export function DaemonPanel() {
  const { connected, retry } = useDaemonConnection()
  const { daemonInfo, isLoading } = useDaemonInfo({ connected })
  const { actionState, actionMessage } = useDaemonActions({ connected, retry })
  const {
    autostartEnabled,
    message: autostartMessage,
    state: autostartState,
    isSupported: autostartSupported,
  } = useAutostart({ enabled: true })

  // Combine messages, prioritizing action messages
  const displayMessage = actionMessage || autostartMessage
  const displayState = actionMessage
    ? actionState
    : autostartState === 'confirming'
      ? 'confirming'
      : 'idle'

  if (!connected) {
    return <DisconnectedView actionMessage={actionMessage} />
  }

  if (isLoading) {
    return (
      <MainPanel title="Daemon">
        <text fg="gray">Loading daemon info...</text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title="Daemon">
      <box flexDirection="column" gap={1}>
        <box flexDirection="row">
          <text>Status: </text>
          <text fg="green">Connected</text>
        </box>
        {daemonInfo && <DaemonInfoDisplay daemonInfo={daemonInfo} />}
        {autostartSupported && (
          <box flexDirection="row">
            <text>Autostart: </text>
            <text fg={autostartEnabled ? 'green' : 'gray'}>
              {autostartEnabled ? 'Enabled' : 'Disabled'}
            </text>
          </box>
        )}
        <DaemonControls
          showAutostartToggle={autostartSupported}
          autostartEnabled={autostartEnabled}
        />
        {displayMessage && (
          <ActionMessage message={displayMessage} actionState={displayState} />
        )}
      </box>
    </MainPanel>
  )
}
