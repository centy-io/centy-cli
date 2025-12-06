/**
 * Unified daemon service layer for TUI
 * Wraps existing daemon functions with a cleaner API
 */

import { daemonListProjects } from '../../daemon/daemon-list-projects.js'
import { daemonListIssues } from '../../daemon/daemon-list-issues.js'
import { daemonListDocs } from '../../daemon/daemon-list-docs.js'
import { daemonGetConfig } from '../../daemon/daemon-get-config.js'
import { daemonGetDaemonInfo } from '../../daemon/daemon-get-daemon-info.js'
import { daemonControlService } from '../../daemon/daemon-control-service.js'
import { checkDaemonConnection } from '../../daemon/check-daemon-connection.js'
import { daemonSetProjectFavorite } from '../../daemon/daemon-set-project-favorite.js'
import type {
  ProjectInfo,
  Issue,
  Doc,
  Config,
  DaemonInfo,
  ShutdownResponse,
  RestartResponse,
} from '../../daemon/types.js'

export interface DaemonServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

export class DaemonService {
  async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    return checkDaemonConnection()
  }

  async listProjects(
    includeStale = false
  ): Promise<DaemonServiceResult<ProjectInfo[]>> {
    try {
      const response = await daemonListProjects({ includeStale })
      return { success: true, data: response.projects }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to list projects',
      }
    }
  }

  async listIssues(
    projectPath: string,
    filters?: { status?: string; priority?: number }
  ): Promise<DaemonServiceResult<Issue[]>> {
    try {
      const response = await daemonListIssues({
        projectPath,
        status: filters?.status,
        priority: filters?.priority,
      })
      return { success: true, data: response.issues }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list issues',
      }
    }
  }

  async listDocs(projectPath: string): Promise<DaemonServiceResult<Doc[]>> {
    try {
      const response = await daemonListDocs({ projectPath })
      return { success: true, data: response.docs }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list docs',
      }
    }
  }

  async getConfig(projectPath: string): Promise<DaemonServiceResult<Config>> {
    try {
      const response = await daemonGetConfig({ projectPath })
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get config',
      }
    }
  }

  async getDaemonInfo(): Promise<DaemonServiceResult<DaemonInfo>> {
    try {
      const response = await daemonGetDaemonInfo({})
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get daemon info',
      }
    }
  }

  async shutdown(
    delaySeconds?: number
  ): Promise<DaemonServiceResult<ShutdownResponse>> {
    return daemonControlService.shutdown({ delaySeconds })
  }

  async restart(
    delaySeconds?: number
  ): Promise<DaemonServiceResult<RestartResponse>> {
    return daemonControlService.restart({ delaySeconds })
  }

  async setProjectFavorite(
    projectPath: string,
    isFavorite: boolean
  ): Promise<DaemonServiceResult<ProjectInfo>> {
    try {
      const response = await daemonSetProjectFavorite({
        projectPath,
        isFavorite,
      })
      if (!response.success) {
        return { success: false, error: response.error }
      }
      return { success: true, data: response.project }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to set project favorite',
      }
    }
  }
}

export const daemonService = new DaemonService()
