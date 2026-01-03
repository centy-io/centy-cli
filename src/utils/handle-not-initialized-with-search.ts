import { NotInitializedError } from './ensure-initialized.js'
import { formatCrossProjectHint } from './format-cross-project-hint.js'
import { formatCrossProjectJson } from './format-cross-project-json.js'

interface ProjectMatch {
  projectName: string
  projectPath: string
}

interface SearchResult {
  matches: ProjectMatch[]
  errors: string[]
}

interface HandleNotInitializedOptions {
  entityType: 'issue' | 'pr' | 'doc'
  identifier: string
  jsonMode: boolean
  globalSearchFn: () => Promise<SearchResult>
  shouldSearch?: (id: string) => boolean
}

interface NotInitializedResult {
  /** Whether the entity was found in other projects */
  foundElsewhere: boolean
  /** Human-readable message to display (use with this.error()) */
  message: string
  /** JSON output if foundElsewhere and jsonMode is true */
  jsonOutput?: object
}

const GLOBAL_HINT =
  '\n\nTip: Use --global (-g) flag to search across all tracked projects.'

/**
 * Handles NotInitializedError by attempting global search and providing helpful hints.
 *
 * @returns Result with message to display, or null if error is not NotInitializedError
 */
export async function handleNotInitializedWithSearch(
  error: unknown,
  options: HandleNotInitializedOptions
): Promise<NotInitializedResult | null> {
  if (!(error instanceof NotInitializedError)) {
    return null
  }

  const { entityType, identifier, jsonMode, globalSearchFn, shouldSearch } =
    options

  // Check if we should attempt global search
  const doSearch = shouldSearch === undefined || shouldSearch(identifier)

  if (doSearch) {
    const result = await globalSearchFn()

    if (result.matches.length > 0) {
      if (jsonMode) {
        return {
          foundElsewhere: true,
          message: '',
          jsonOutput: formatCrossProjectJson(
            entityType,
            identifier,
            result.matches
          ),
        }
      }

      return {
        foundElsewhere: true,
        message: formatCrossProjectHint(entityType, identifier, result.matches),
      }
    }
  }

  // Not found anywhere - return original error with hint
  return {
    foundElsewhere: false,
    message: error.message + GLOBAL_HINT,
  }
}
