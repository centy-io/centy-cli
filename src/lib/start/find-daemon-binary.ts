import { findBinary } from '../find-binary/index.js'

const DAEMON_BINARY_NAME = 'centy-daemon'
const DAEMON_ENV_VAR = 'CENTY_DAEMON_PATH'

export function findDaemonBinary(): string {
  return findBinary({
    binaryName: DAEMON_BINARY_NAME,
    envVar: DAEMON_ENV_VAR,
    devRepoName: 'centy-daemon',
  })
}
