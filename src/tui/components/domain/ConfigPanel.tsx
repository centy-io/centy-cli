import { useRef } from 'react'
import { useKeyboard } from '@opentui/react'
import type { KeyEvent, ScrollBoxRenderable } from '@opentui/core'
import { MainPanel } from '../layout/MainPanel.js'
import { useConfig } from '../../hooks/useConfig.js'
import { useAppState } from '../../state/app-state.js'
import type { Config, CustomFieldDefinition } from '../../../daemon/types.js'

interface ConfigSectionProps {
  title: string
  children: React.ReactNode
}

function ConfigSection({ title, children }: ConfigSectionProps) {
  return (
    <box flexDirection="column" marginBottom={1}>
      <text fg="cyan">
        <b>{title}</b>
      </text>
      <box paddingLeft={2} flexDirection="column">
        {children}
      </box>
    </box>
  )
}

interface CustomFieldDisplayProps {
  field: CustomFieldDefinition
}

function CustomFieldDisplay({ field }: CustomFieldDisplayProps) {
  return (
    <box flexDirection="column" marginBottom={1}>
      <box flexDirection="row">
        <text fg="yellow">{field.name}</text>
        <text fg="gray"> ({field.fieldType})</text>
        {field.required && <text fg="red"> *required</text>}
      </box>
      {field.defaultValue && (
        <box paddingLeft={2}>
          <text fg="gray">Default: {field.defaultValue}</text>
        </box>
      )}
      {field.enumValues.length > 0 && (
        <box paddingLeft={2}>
          <text fg="gray">Values: {field.enumValues.join(', ')}</text>
        </box>
      )}
    </box>
  )
}

interface ConfigContentProps {
  config: Config
}

function ConfigContent({ config }: ConfigContentProps) {
  return (
    <box flexDirection="column">
      {/* Version */}
      <ConfigSection title="Version">
        <text>{config.version}</text>
      </ConfigSection>

      {/* States */}
      <ConfigSection title="Allowed States">
        <box flexDirection="row" flexWrap="wrap">
          {config.allowedStates.map((state, index) => (
            <box key={state} flexDirection="row">
              <text fg={state === config.defaultState ? 'green' : undefined}>
                {state}
              </text>
              {state === config.defaultState && (
                <text fg="gray"> (default)</text>
              )}
              {index < config.allowedStates.length - 1 && (
                <text fg="gray">, </text>
              )}
            </box>
          ))}
        </box>
      </ConfigSection>

      {/* Priority */}
      <ConfigSection title="Priority Levels">
        <text>
          {config.priorityLevels} levels (1 = highest, {config.priorityLevels} =
          lowest)
        </text>
      </ConfigSection>

      {/* Custom Fields */}
      {config.customFields.length > 0 && (
        <ConfigSection title="Custom Fields">
          {config.customFields.map(field => (
            <CustomFieldDisplay key={field.name} field={field} />
          ))}
        </ConfigSection>
      )}

      {/* Defaults */}
      {Object.keys(config.defaults).length > 0 && (
        <ConfigSection title="Defaults">
          {Object.entries(config.defaults).map(([key, value]) => (
            <box key={key} flexDirection="row">
              <text fg="yellow">{key}: </text>
              <text>{value}</text>
            </box>
          ))}
        </ConfigSection>
      )}
    </box>
  )
}

export function ConfigPanel() {
  const { config, isLoading } = useConfig()
  const { state } = useAppState()
  const scrollBoxRef = useRef<ScrollBoxRenderable>(null)

  useKeyboard((event: KeyEvent) => {
    if (event.name === 'j' || event.name === 'down') {
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollBy(1)
      }
    } else if (event.name === 'k' || event.name === 'up') {
      if (scrollBoxRef.current) {
        scrollBoxRef.current.scrollBy(-1)
      }
    }
  })

  const projectName = state.selectedProjectPath?.split('/').pop() || 'Project'

  if (!state.selectedProjectPath) {
    return (
      <MainPanel title="Config">
        <text fg="gray">Select a project first.</text>
      </MainPanel>
    )
  }

  if (isLoading) {
    return (
      <MainPanel title={`Config - ${projectName}`}>
        <text fg="gray">Loading config...</text>
      </MainPanel>
    )
  }

  if (!config) {
    return (
      <MainPanel title={`Config - ${projectName}`}>
        <text fg="gray">No config found.</text>
        <text fg="gray">
          Initialize the project with `centy init` to create config.
        </text>
      </MainPanel>
    )
  }

  return (
    <MainPanel title={`Config - ${projectName}`}>
      <scrollbox ref={scrollBoxRef} flexGrow={1} scrollY={true}>
        <ConfigContent config={config} />
      </scrollbox>
    </MainPanel>
  )
}
