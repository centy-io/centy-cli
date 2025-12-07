import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react'
import type { ViewId, ViewParams } from '../types/views.js'
import type {
  Issue,
  Doc,
  ProjectInfo,
  Config,
  DaemonInfo,
} from '../../daemon/types.js'

// Sort options for issues list
export type IssueSortField =
  | 'priority'
  | 'displayNumber'
  | 'createdAt'
  | 'updatedAt'
  | 'status'

export type SortDirection = 'asc' | 'desc'

export interface IssueSortConfig {
  field: IssueSortField
  direction: SortDirection
}

export const SORT_FIELD_LABELS: Record<IssueSortField, string> = {
  priority: 'Priority',
  displayNumber: 'Number',
  createdAt: 'Created',
  updatedAt: 'Updated',
  status: 'Status',
}

export const DEFAULT_SORT_CONFIG: IssueSortConfig = {
  field: 'priority',
  direction: 'asc', // Lower priority number = higher priority, so asc means highest first
}

export interface AppState {
  // Navigation
  currentView: ViewId
  viewParams: ViewParams
  viewHistory: Array<{ view: ViewId; params: ViewParams }>

  // Project
  projects: ProjectInfo[]
  selectedProjectPath: string | null

  // Data
  issues: Issue[]
  docs: Doc[]
  config: Config | null
  daemonInfo: DaemonInfo | null

  // Selection
  selectedIssueId: string | null
  selectedDocSlug: string | null
  sidebarIndex: number

  // UI state
  isLoading: boolean
  error: string | null

  // Daemon connection
  daemonConnected: boolean

  // Issue list sorting
  issueSort: IssueSortConfig
}

export type AppAction =
  | { type: 'NAVIGATE'; view: ViewId; params?: ViewParams }
  | { type: 'GO_BACK' }
  | { type: 'SET_PROJECTS'; projects: ProjectInfo[] }
  | { type: 'UPDATE_PROJECT'; project: ProjectInfo }
  | { type: 'REMOVE_PROJECT'; path: string }
  | { type: 'SELECT_PROJECT'; path: string }
  | { type: 'SET_ISSUES'; issues: Issue[] }
  | { type: 'SET_DOCS'; docs: Doc[] }
  | { type: 'SET_CONFIG'; config: Config }
  | { type: 'SET_DAEMON_INFO'; info: DaemonInfo }
  | { type: 'SELECT_ISSUE'; id: string | null }
  | { type: 'SELECT_DOC'; slug: string | null }
  | { type: 'SET_SIDEBAR_INDEX'; index: number }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_DAEMON_STATUS'; connected: boolean }
  | { type: 'SET_ISSUE_SORT'; sort: IssueSortConfig }

const initialState: AppState = {
  currentView: 'projects',
  viewParams: {},
  viewHistory: [],
  projects: [],
  selectedProjectPath: null,
  issues: [],
  docs: [],
  config: null,
  daemonInfo: null,
  selectedIssueId: null,
  selectedDocSlug: null,
  sidebarIndex: 0,
  isLoading: false,
  error: null,
  daemonConnected: false,
  issueSort: DEFAULT_SORT_CONFIG,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        viewHistory: [
          ...state.viewHistory,
          { view: state.currentView, params: state.viewParams },
        ],
        currentView: action.view,
        viewParams: action.params ?? {},
      }

    case 'GO_BACK': {
      if (state.viewHistory.length === 0) return state
      const prev = state.viewHistory[state.viewHistory.length - 1]
      return {
        ...state,
        viewHistory: state.viewHistory.slice(0, -1),
        currentView: prev.view,
        viewParams: prev.params,
      }
    }

    case 'SET_PROJECTS':
      return { ...state, projects: action.projects }

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.path === action.project.path ? action.project : p
        ),
      }

    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.path !== action.path),
      }

    case 'SELECT_PROJECT':
      return {
        ...state,
        selectedProjectPath: action.path,
        // Reset data when switching projects
        issues: [],
        docs: [],
        config: null,
      }

    case 'SET_ISSUES':
      return { ...state, issues: action.issues }

    case 'SET_DOCS':
      return { ...state, docs: action.docs }

    case 'SET_CONFIG':
      return { ...state, config: action.config }

    case 'SET_DAEMON_INFO':
      return { ...state, daemonInfo: action.info }

    case 'SELECT_ISSUE':
      return { ...state, selectedIssueId: action.id }

    case 'SELECT_DOC':
      return { ...state, selectedDocSlug: action.slug }

    case 'SET_SIDEBAR_INDEX':
      return { ...state, sidebarIndex: action.index }

    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }

    case 'SET_ERROR':
      return { ...state, error: action.error }

    case 'SET_DAEMON_STATUS':
      return { ...state, daemonConnected: action.connected }

    case 'SET_ISSUE_SORT':
      return { ...state, issueSort: action.sort }

    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const AppContext = createContext<AppContextValue | null>(null)

interface AppProviderProps {
  children: ReactNode
  initialDaemonConnected?: boolean
  initialIssueSort?: IssueSortConfig
}

export function AppProvider({
  children,
  initialDaemonConnected = false,
  initialIssueSort,
}: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    daemonConnected: initialDaemonConnected,
    issueSort: initialIssueSort ?? DEFAULT_SORT_CONFIG,
  })

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context
}
