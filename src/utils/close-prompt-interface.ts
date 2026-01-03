import type { Interface } from 'node:readline'

/**
 * Close a readline interface
 */
export function closePromptInterface(rl: Interface): void {
  rl.close()
}
