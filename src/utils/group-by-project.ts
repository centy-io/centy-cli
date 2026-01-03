/**
 * Groups items by project name
 */
interface ItemWithProject {
  projectName: string
}

/**
 * Groups items by their project name
 */
export function groupByProject<T extends ItemWithProject>(
  items: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  for (const item of items) {
    const existing = grouped.get(item.projectName)
    if (existing !== undefined) {
      existing.push(item)
    } else {
      grouped.set(item.projectName, [item])
    }
  }
  return grouped
}
