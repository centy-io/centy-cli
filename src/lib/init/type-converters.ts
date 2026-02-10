/* eslint-disable single-export/single-export */

import type { FileInfo } from '../../daemon/types.js'

export interface FileToRestore {
  path: string
  wasInManifest: boolean
}

export interface FileToReset {
  path: string
  currentHash: string
  originalHash: string
}

export function fileInfoToRestoreFormat(info: FileInfo): FileToRestore {
  return {
    path: info.path,
    wasInManifest: true,
  }
}

export function fileInfoToResetFormat(info: FileInfo): FileToReset {
  return {
    path: info.path,
    currentHash: info.hash,
    originalHash: '',
  }
}
