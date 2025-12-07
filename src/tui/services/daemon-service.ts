/**
 * Unified daemon service layer for TUI
 * Wraps existing daemon functions with a cleaner API
 */

import { daemonListProjects } from '../../daemon/daemon-list-projects.js'
import { daemonListIssues } from '../../daemon/daemon-list-issues.js'
import { daemonListDocs } from '../../daemon/daemon-list-docs.js'
import { daemonListAssets } from '../../daemon/daemon-list-assets.js'
import { daemonGetConfig } from '../../daemon/daemon-get-config.js'
import { daemonGetDaemonInfo } from '../../daemon/daemon-get-daemon-info.js'
import { daemonControlService } from '../../daemon/daemon-control-service.js'
import { checkDaemonConnection } from '../../daemon/check-daemon-connection.js'
import { daemonSetProjectFavorite } from '../../daemon/daemon-set-project-favorite.js'
import { daemonSetProjectArchived } from '../../daemon/daemon-set-project-archived.js'
import { daemonUntrackProject } from '../../daemon/daemon-untrack-project.js'
import { daemonGetDoc } from '../../daemon/daemon-get-doc.js'
import { daemonGetIssue } from '../../daemon/daemon-get-issue.js'
import { daemonCreateIssue } from '../../daemon/daemon-create-issue.js'
import { daemonCreateDoc } from '../../daemon/daemon-create-doc.js'
import { daemonRegisterProject } from '../../daemon/daemon-register-project.js'
import { daemonInit } from '../../daemon/daemon-init.js'
import type {
  ProjectInfo,
  Issue,
  Doc,
  Config,
  DaemonInfo,
  ShutdownResponse,
  RestartResponse,
  Asset,
  CreateIssueResponse,
  CreateDocResponse,
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
    options: {
      includeStale?: boolean
      includeUninitialized?: boolean
      includeArchived?: boolean
    } = {}
  ): Promise<DaemonServiceResult<ProjectInfo[]>> {
    try {
      const response = await daemonListProjects({
        includeStale: options.includeStale ?? false,
        includeUninitialized: options.includeUninitialized ?? false,
        includeArchived: options.includeArchived ?? false,
      })
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

  async setProjectArchived(
    projectPath: string,
    isArchived: boolean
  ): Promise<DaemonServiceResult<ProjectInfo>> {
    try {
      const response = await daemonSetProjectArchived({
        projectPath,
        isArchived,
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
            : 'Failed to set project archived',
      }
    }
  }

  async untrackProject(
    projectPath: string
  ): Promise<DaemonServiceResult<void>> {
    try {
      const response = await daemonUntrackProject({
        projectPath,
      })
      if (!response.success) {
        return { success: false, error: response.error }
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to untrack project',
      }
    }
  }

  async listAssets(
    projectPath: string,
    options?: { issueId?: string; includeShared?: boolean }
  ): Promise<DaemonServiceResult<Asset[]>> {
    try {
      const response = await daemonListAssets({
        projectPath,
        issueId: options?.issueId,
        includeShared: options?.includeShared ?? true,
      })
      return { success: true, data: response.assets }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list assets',
      }
    }
  }

  async getDoc(
    projectPath: string,
    slug: string
  ): Promise<DaemonServiceResult<Doc>> {
    try {
      const response = await daemonGetDoc({ projectPath, slug })
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get doc',
      }
    }
  }

  async getIssue(
    projectPath: string,
    issueId: string
  ): Promise<DaemonServiceResult<Issue>> {
    try {
      const response = await daemonGetIssue({ projectPath, issueId })
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get issue',
      }
    }
  }

  async createIssue(
    projectPath: string,
    options: {
      title: string
      description: string
      priority?: number
      status?: string
    }
  ): Promise<DaemonServiceResult<CreateIssueResponse>> {
    try {
      const response = await daemonCreateIssue({
        projectPath,
        title: options.title,
        description: options.description,
        priority: options.priority ?? 0,
        status: options.status ?? 'open',
        customFields: {},
      })
      if (!response.success) {
        return { success: false, error: response.error }
      }
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create issue',
      }
    }
  }

  async createDoc(
    projectPath: string,
    options: {
      title: string
      content: string
      slug?: string
    }
  ): Promise<DaemonServiceResult<CreateDocResponse>> {
    try {
      const response = await daemonCreateDoc({
        projectPath,
        title: options.title,
        content: options.content,
        slug: options.slug,
      })
      if (!response.success) {
        return { success: false, error: response.error }
      }
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create doc',
      }
    }
  }

  async registerProject(
    projectPath: string,
    options?: { autoInit?: boolean }
  ): Promise<DaemonServiceResult<ProjectInfo>> {
    try {
      const registerResponse = await daemonRegisterProject({ projectPath })
      if (!registerResponse.success) {
        return { success: false, error: registerResponse.error }
      }

      // Auto-initialize if requested and not already initialized
      if (options?.autoInit && !registerResponse.project.initialized) {
        const initResponse = await daemonInit({
          projectPath,
          force: true,
        })
        if (!initResponse.success) {
          return { success: false, error: initResponse.error }
        }
        // Return updated project info with initialized: true
        return {
          success: true,
          data: { ...registerResponse.project, initialized: true },
        }
      }

      return { success: true, data: registerResponse.project }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to register project',
      }
    }
  }
}

export const daemonService = new DaemonService()
