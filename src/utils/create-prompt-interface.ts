import { createInterface, type Interface } from 'node:readline'

/**
 * Create a readline interface for prompts
 */
export function createPromptInterface(
  input?: NodeJS.ReadableStream,
  output?: NodeJS.WritableStream
): Interface {
  const inputStream = input !== undefined ? input : process.stdin
  const outputStream = output !== undefined ? output : process.stdout
  return createInterface({ input: inputStream, output: outputStream })
}
