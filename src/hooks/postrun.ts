import { createRequire } from 'node:module'
import { Hook } from '@oclif/core'
// eslint-disable-next-line import/order
import updateNotifier from 'update-notifier'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

const hook: Hook<'postrun'> = async function () {
  const notifier = updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24, // Check once per day
  })

  notifier.notify({
    isGlobal: true,
    message: `Update available: {currentVersion} → {latestVersion}\n\nRun {updateCommand} to update`,
  })
}

export default hook
