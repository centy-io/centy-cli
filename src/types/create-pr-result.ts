/**
 * Result of creating a PR
 */
export type CreatePrResult =
  | {
      success: true
      prId: string
      displayNumber: number
      prPath: string
      prMarkdownPath: string
      metadataPath: string
      sourceBranch: string
    }
  | {
      success: false
      error: string
    }
