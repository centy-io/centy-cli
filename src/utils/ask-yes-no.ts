import type { Interface } from 'node:readline'

/**
 * Ask a simple yes/no question with configurable default
 * @param rl - readline interface
 * @param question - The question to ask
 * @param defaultYes - If true, default to 'yes' (Y/n); if false, default to 'no' (y/N)
 * @returns Promise resolving to true for yes, false for no
 */
export async function askYesNo(
  rl: Interface,
  question: string,
  defaultYes: boolean | undefined
): Promise<boolean> {
  // eslint-disable-next-line no-restricted-syntax
  const useDefaultYes = defaultYes ?? false
  const hint = useDefaultYes ? '[Y/n]' : '[y/N]'
  return new Promise(resolve => {
    rl.question(`${question} ${hint}: `, answer => {
      const normalized = answer.toLowerCase().trim()
      if (normalized === '') {
        resolve(useDefaultYes)
      } else if (normalized === 'y' || normalized === 'yes') {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
