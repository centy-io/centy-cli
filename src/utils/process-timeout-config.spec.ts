import { describe, it, expect } from 'vitest'
import {
  BUN_CHECK_TIMEOUT_MS,
  EXTRACT_TIMEOUT_MS,
  GIT_COMMAND_TIMEOUT_MS,
  INSTALL_TIMEOUT_MS,
  PROMPT_TIMEOUT_MS,
  SERVICE_COMMAND_TIMEOUT_MS,
} from './process-timeout-config.js'

describe('process-timeout-config', () => {
  it('should export BUN_CHECK_TIMEOUT_MS as a positive number', () => {
    expect(BUN_CHECK_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should export INSTALL_TIMEOUT_MS as a positive number', () => {
    expect(INSTALL_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should export PROMPT_TIMEOUT_MS as a positive number', () => {
    expect(PROMPT_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should export SERVICE_COMMAND_TIMEOUT_MS as a positive number', () => {
    expect(SERVICE_COMMAND_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should export EXTRACT_TIMEOUT_MS as a positive number', () => {
    expect(EXTRACT_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should export GIT_COMMAND_TIMEOUT_MS as a positive number', () => {
    expect(GIT_COMMAND_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it('should have install timeout greater than bun check timeout', () => {
    expect(INSTALL_TIMEOUT_MS).toBeGreaterThan(BUN_CHECK_TIMEOUT_MS)
  })

  it('should have extract timeout greater than git command timeout', () => {
    expect(EXTRACT_TIMEOUT_MS).toBeGreaterThan(GIT_COMMAND_TIMEOUT_MS)
  })
})
