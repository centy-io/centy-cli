/* eslint-disable single-export/single-export */

/**
 * Timeout for quick commands like version checks (5 seconds)
 */
export const BUN_CHECK_TIMEOUT_MS = 5_000

/**
 * Timeout for installation commands like daemon install (2 minutes)
 */
export const INSTALL_TIMEOUT_MS = 120_000

/**
 * Timeout for interactive prompts waiting for user input (60 seconds)
 */
export const PROMPT_TIMEOUT_MS = 60_000

/**
 * Timeout for system service commands like launchctl (30 seconds)
 */
export const SERVICE_COMMAND_TIMEOUT_MS = 30_000
