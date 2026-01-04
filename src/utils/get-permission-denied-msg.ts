export function getPermissionDeniedMsg(path: string): string {
  if (process.platform === 'win32') {
    return `Permission denied: ${path}

Check that the file is not blocked by Windows security.
Right-click the file > Properties > Unblock (if available).`
  }
  return `Permission denied: ${path}

Run: chmod +x "${path}"`
}
