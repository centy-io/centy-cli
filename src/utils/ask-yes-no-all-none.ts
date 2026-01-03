import type { Interface } from 'node:readline'
import type { PromptChoice } from './prompt-choice.js'

/**
 * Ask a yes/no/all/none question
 */
export async function askYesNoAllNone(
  rl: Interface,
  question: string
): Promise<PromptChoice> {
  return new Promise(resolve => {
    rl.question(`${question} [y/n/a(ll)/none]: `, answer => {
      const normalized = answer.toLowerCase().trim()
      if (normalized === 'y' || normalized === 'yes') {
        resolve('yes')
      } else if (normalized === 'a' || normalized === 'all') {
        resolve('all')
      } else if (normalized === 'none') {
        resolve('none')
      } else {
        resolve('no')
      }
    })
  })
}
