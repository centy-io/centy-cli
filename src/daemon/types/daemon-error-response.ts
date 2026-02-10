import type { DaemonErrorMessage } from './daemon-error-message.js'

export interface DaemonErrorResponse {
  cwd?: string
  logs?: string
  messages: DaemonErrorMessage[]
}
