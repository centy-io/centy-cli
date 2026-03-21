import { createInterface } from 'node:readline'
import { PROMPT_TIMEOUT_MS } from './process-timeout-config.js'

/**
 * Ask a question via readline with an inactivity timeout.
 * Returns the user's answer, or null if the timeout expires before input is received.
 */
export async function promptQuestion(
  question: string,
  timeoutMs: number | undefined
): Promise<string | null> {
  const resolvedTimeoutMs =
    timeoutMs !== undefined ? timeoutMs : PROMPT_TIMEOUT_MS
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<string | null>(resolve => {
    const timeoutId = setTimeout(() => {
      process.stdout.write('\n')
      rl.close()
      resolve(null)
    }, resolvedTimeoutMs)

    rl.question(question, answer => {
      clearTimeout(timeoutId)
      rl.close()
      resolve(answer)
    })
  })
}
