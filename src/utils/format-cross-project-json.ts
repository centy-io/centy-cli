/**
 * Returns structured JSON output for --json flag when entity is found in other projects
 */
export function formatCrossProjectJson(
  entityType: string,
  id: string,
  matches: Array<{
    projectName: string
    projectPath: string
    displayNumber?: number
  }>
): object {
  return {
    error: 'NOT_FOUND',
    message: `${entityType} not found in current project`,
    foundIn: matches.map(m => ({
      projectName: m.projectName,
      projectPath: m.projectPath,
      ...(m.displayNumber !== undefined && { displayNumber: m.displayNumber }),
    })),
    suggestion: `Run: centy get ${entityType} ${id} --global`,
  }
}
