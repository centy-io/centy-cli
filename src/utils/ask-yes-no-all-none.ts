import prompts from 'prompts'
import type { PromptChoice } from './prompt-choice.js'

/**
 * Ask a yes/no/all/none question
 */
export async function askYesNoAllNone(question: string): Promise<PromptChoice> {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: question,
    choices: [
      { title: 'Yes', value: 'yes' },
      { title: 'No', value: 'no' },
      { title: 'All', value: 'all' },
      { title: 'None', value: 'none' },
    ],
  })
  const value: PromptChoice | undefined = response.value
  if (value === undefined) {
    return 'no'
  }
  return value
}
