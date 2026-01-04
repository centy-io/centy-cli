export function getMissingBinaryMsg(
  path: string,
  binaryName: string,
  envVar: string
): string {
  return `${binaryName} not found at: ${path}

The ${binaryName} binary could not be located.
Set ${envVar} to specify the binary path.`
}
