/**
 * Formats a helpful error message when an entity is found in other projects
 * but not in the current project
 */
export function formatCrossProjectHint(
  entityType: 'issue' | 'pr' | 'doc',
  id: string,
  matches: Array<{ projectName: string; projectPath: string }>
): string {
  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1)
  const lines = [
    `${entityLabel} not found in current project.`,
    '',
    'Found in:',
    ...matches.map(m => `  - ${m.projectName} (${m.projectPath})`),
    '',
    `Run: centy get ${entityType} ${id} --global`,
  ]
  return lines.join('\n')
}
