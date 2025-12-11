/* eslint-disable ddd/require-spec-file */
import type { CreatePrRequest, CreatePrResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Create a PR via daemon
 */
export function daemonCreatePr(
  request: CreatePrRequest
): Promise<CreatePrResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().createPr(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
