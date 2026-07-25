import { describe, it, expect } from 'vitest'
import {
  INSTALL_TIMEOUT_MS,
  PROMPT_TIMEOUT_MS,
  SERVICE_COMMAND_TIMEOUT_MS,
} from './process-timeout-config.js'

describe('process-timeout-config', () => {
  it('should export INSTALL_TIMEOUT_MS as a positive number', () => {
    expect(INSTALL_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should export PROMPT_TIMEOUT_MS as a positive number', () => {
    expect(PROMPT_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should export SERVICE_COMMAND_TIMEOUT_MS as a positive number', () => {
    expect(SERVICE_COMMAND_TIMEOUT_MS).toBeGreaterThan(0)
  })
})
