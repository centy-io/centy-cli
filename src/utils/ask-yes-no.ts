import prompts from 'prompts'

/**
 * Ask a simple yes/no question with configurable default
 * @param question - The question to ask
 * @param defaultYes - If true, default to 'yes'; if false, default to 'no'
 * @returns Promise resolving to true for yes, false for no
 */
export async function askYesNo(
  question: string,
  defaultYes: boolean | undefined
): Promise<boolean> {
  const initial = defaultYes !== undefined ? defaultYes : false
  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message: question,
    initial,
  })
  if (response.value === undefined) {
    return initial
  }
  return response.value
}
