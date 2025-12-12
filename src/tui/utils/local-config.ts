/* eslint-disable single-export/single-export */

/**
 * Local configuration utility for TUI user preferences.
 * Stores settings in config.local.json in the user's home directory.
 * This file is user-specific and should not be committed to version control.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import type { IssueSortConfig, PrSortConfig } from '../state/app-state.js'
import {
  DEFAULT_SORT_CONFIG,
  DEFAULT_PR_SORT_CONFIG,
} from '../state/app-state.js'

// Config directory and file paths for local user preferences
const CONFIG_DIR = join(homedir(), '.centy')
const CONFIG_FILE = join(CONFIG_DIR, 'config.local.json')

export interface LocalConfig {
  issueSort?: IssueSortConfig
  prSort?: PrSortConfig
}

function ensureConfigDir(): void {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!existsSync(CONFIG_DIR)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

export function loadLocalConfig(): LocalConfig {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!existsSync(CONFIG_FILE)) {
      return {}
    }
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = readFileSync(CONFIG_FILE, 'utf-8')
    // eslint-disable-next-line no-restricted-syntax
    return JSON.parse(content) as LocalConfig
  } catch {
    // If file doesn't exist or is invalid, return empty config
    return {}
  }
}

export function saveLocalConfig(config: LocalConfig): void {
  try {
    ensureConfigDir()
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
  } catch {
    // Silently fail if we can't write the config
  }
}

export function loadIssueSortConfig(): IssueSortConfig {
  const config = loadLocalConfig()
  // eslint-disable-next-line no-restricted-syntax
  return config.issueSort ?? DEFAULT_SORT_CONFIG
}

export function saveIssueSortConfig(sortConfig: IssueSortConfig): void {
  const config = loadLocalConfig()
  config.issueSort = sortConfig
  saveLocalConfig(config)
}

export function loadPrSortConfig(): PrSortConfig {
  const config = loadLocalConfig()
  // eslint-disable-next-line no-restricted-syntax
  return config.prSort ?? DEFAULT_PR_SORT_CONFIG
}

export function savePrSortConfig(sortConfig: PrSortConfig): void {
  const config = loadLocalConfig()
  config.prSort = sortConfig
  saveLocalConfig(config)
}
