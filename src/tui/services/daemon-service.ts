/* eslint-disable single-export/single-export, max-lines */

/**
 * Unified daemon service layer for TUI
 * Wraps existing daemon functions with a cleaner API
 */

import { daemonListProjects } from '../../daemon/daemon-list-projects.js'
import { daemonListIssues } from '../../daemon/daemon-list-issues.js'
import { daemonListPrs } from '../../daemon/daemon-list-prs.js'
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
import { daemonGetPr } from '../../daemon/daemon-get-pr.js'
import { daemonCreateIssue } from '../../daemon/daemon-create-issue.js'
import { daemonCreatePr } from '../../daemon/daemon-create-pr.js'
import { daemonUpdateIssue } from '../../daemon/daemon-update-issue.js'
import { daemonUpdatePr } from '../../daemon/daemon-update-pr.js'
import { daemonCreateDoc } from '../../daemon/daemon-create-doc.js'
import { daemonRegisterProject } from '../../daemon/daemon-register-project.js'
import { daemonInit } from '../../daemon/daemon-init.js'
import type {
  ProjectInfo,
  Issue,
  PullRequest,
  Doc,
  Config,
  DaemonInfo,
  ShutdownResponse,
  RestartResponse,
  Asset,
  CreateIssueResponse,
  CreatePrResponse,
  CreateDocResponse,
  UpdateIssueResponse,
  UpdatePrResponse,
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
    // eslint-disable-next-line default/no-default-params
    options: {
      includeStale?: boolean
      includeUninitialized?: boolean
      includeArchived?: boolean
    } = {}
  ): Promise<DaemonServiceResult<ProjectInfo[]>> {
    try {
      const response = await daemonListProjects({
        // eslint-disable-next-line no-restricted-syntax
        includeStale: options.includeStale ?? false,
        // eslint-disable-next-line no-restricted-syntax
        includeUninitialized: options.includeUninitialized ?? false,
        // eslint-disable-next-line no-restricted-syntax
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
        // eslint-disable-next-line no-optional-chaining/no-optional-chaining
        status: filters?.status,
        // eslint-disable-next-line no-optional-chaining/no-optional-chaining
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

  async listPrs(
    projectPath: string,
    filters?: {
      status?: string
      priority?: number
      sourceBranch?: string
      targetBranch?: string
    }
  ): Promise<DaemonServiceResult<PullRequest[]>> {
    try {
      const response = await daemonListPrs({
        projectPath,
        // eslint-disable-next-line no-optional-chaining/no-optional-chaining
        status: filters?.status,
        // eslint-disable-next-line no-optional-chaining/no-optional-chaining
        priority: filters?.priority,
        // eslint-disable-next-line no-optional-chaining/no-optional-chaining
        sourceBranch: filters?.sourceBranch,
        // eslint-disable-next-line no-optional-chaining/no-optional-chaining
        targetBranch: filters?.targetBranch,
      })
      return { success: true, data: response.prs }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list PRs',
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
        // eslint-disable-next-line no-optional-chaining/no-optional-chaining
        issueId: options?.issueId,
        // eslint-disable-next-line no-restricted-syntax, no-optional-chaining/no-optional-chaining
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

  async getPr(
    projectPath: string,
    prId: string
  ): Promise<DaemonServiceResult<PullRequest>> {
    try {
      const response = await daemonGetPr({ projectPath, prId })
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get PR',
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
        // eslint-disable-next-line no-restricted-syntax
        priority: options.priority ?? 0,
        // eslint-disable-next-line no-restricted-syntax
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

  async updateIssue(
    projectPath: string,
    issueId: string,
    options: {
      title?: string
      description?: string
      priority?: number
      status?: string
      customFields?: Record<string, string>
    }
  ): Promise<DaemonServiceResult<UpdateIssueResponse>> {
    try {
      const response = await daemonUpdateIssue({
        projectPath,
        issueId,
        title: options.title,
        description: options.description,
        priority: options.priority,
        status: options.status,
        customFields: options.customFields,
      })
      if (!response.success) {
        return { success: false, error: response.error }
      }
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update issue',
      }
    }
  }

  async createPr(
    projectPath: string,
    options: {
      title: string
      description: string
      sourceBranch?: string
      targetBranch?: string
      linkedIssues?: string[]
      reviewers?: string[]
      priority?: number
      status?: string
    }
  ): Promise<DaemonServiceResult<CreatePrResponse>> {
    try {
      const response = await daemonCreatePr({
        projectPath,
        title: options.title,
        description: options.description,
        sourceBranch: options.sourceBranch,
        targetBranch: options.targetBranch,
        // eslint-disable-next-line no-restricted-syntax
        linkedIssues: options.linkedIssues ?? [],
        // eslint-disable-next-line no-restricted-syntax
        reviewers: options.reviewers ?? [],
        // eslint-disable-next-line no-restricted-syntax
        priority: options.priority ?? 0,
        // eslint-disable-next-line no-restricted-syntax
        status: options.status ?? 'draft',
        customFields: {},
      })
      if (!response.success) {
        return { success: false, error: response.error }
      }
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create PR',
      }
    }
  }

  async updatePr(
    projectPath: string,
    prId: string,
    options: {
      title?: string
      description?: string
      sourceBranch?: string
      targetBranch?: string
      linkedIssues?: string[]
      reviewers?: string[]
      priority?: number
      status?: string
      customFields?: Record<string, string>
    }
  ): Promise<DaemonServiceResult<UpdatePrResponse>> {
    try {
      const response = await daemonUpdatePr({
        projectPath,
        prId,
        title: options.title,
        description: options.description,
        sourceBranch: options.sourceBranch,
        targetBranch: options.targetBranch,
        linkedIssues: options.linkedIssues,
        reviewers: options.reviewers,
        priority: options.priority,
        status: options.status,
        customFields: options.customFields,
      })
      if (!response.success) {
        return { success: false, error: response.error }
      }
      return { success: true, data: response }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update PR',
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
      // eslint-disable-next-line no-optional-chaining/no-optional-chaining
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
