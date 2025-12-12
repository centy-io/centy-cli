import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchLatestRelease, fetchRelease } from './github-api.js'
import { GithubApiError, ReleaseNotFoundError } from './errors.js'
import type { GithubRelease } from './types.js'

// Mock fetch globally
const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
  mockFetch.mockReset()
})

// Helper to create mock Response
function createMockResponse(
  status: number,
  data?: unknown,
  statusText = ''
): Response {
  // eslint-disable-next-line no-restricted-syntax
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(data),
  } as Response
}

// Sample release data
const mockRelease: GithubRelease = {
  tag_name: 'v0.1.0',
  assets: [
    {
      name: 'centy-daemon-x86_64-unknown-linux-gnu.tar.gz',
      browser_download_url:
        'https://github.com/centy-io/centy-daemon/releases/download/v0.1.0/centy-daemon-x86_64-unknown-linux-gnu.tar.gz',
    },
  ],
}

describe('fetchLatestRelease', () => {
  it('should return the latest stable release', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(200, mockRelease))

    const release = await fetchLatestRelease()

    expect(release).toEqual(mockRelease)
    expect(release).toHaveProperty('tag_name')
    expect(release).toHaveProperty('assets')
    expect(Array.isArray(release.assets)).toBe(true)
  })

  it('should fall back to pre-release when no stable release exists', async () => {
    const preRelease: GithubRelease = {
      tag_name: 'v0.1.0-beta.1',
      assets: [],
    }

    // First call returns 404 (no stable release)
    mockFetch.mockResolvedValueOnce(createMockResponse(404, null, 'Not Found'))
    // Second call returns pre-releases list
    mockFetch.mockResolvedValueOnce(createMockResponse(200, [preRelease]))

    const release = await fetchLatestRelease()

    expect(release).toEqual(preRelease)
  })

  it('should throw GithubApiError when no releases exist', async () => {
    // First call returns 404 (no stable release)
    mockFetch.mockResolvedValueOnce(createMockResponse(404, null, 'Not Found'))
    // Second call returns empty array
    mockFetch.mockResolvedValueOnce(createMockResponse(200, []))

    await expect(fetchLatestRelease()).rejects.toThrow(
      'No releases found for centy-daemon'
    )
  })

  it('should throw GithubApiError on rate limit', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(403, null, 'rate limit exceeded')
    )

    await expect(fetchLatestRelease()).rejects.toThrow(GithubApiError)
  })

  it('should throw GithubApiError on server error', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(500, null, 'Internal Server Error')
    )

    await expect(fetchLatestRelease()).rejects.toThrow(GithubApiError)
  })
})

describe('fetchRelease', () => {
  it('should return a specific release by version', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(200, mockRelease))

    const release = await fetchRelease('v0.1.0')

    expect(release).toEqual(mockRelease)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/releases/tags/v0.1.0'),
      expect.any(Object)
    )
  })

  it('should add v prefix if missing', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(200, mockRelease))

    await fetchRelease('0.1.0')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/releases/tags/v0.1.0'),
      expect.any(Object)
    )
  })

  it('should throw ReleaseNotFoundError for non-existent version', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(404, null, 'Not Found'))

    await expect(fetchRelease('v0.0.0-nonexistent')).rejects.toThrow(
      ReleaseNotFoundError
    )
  })

  it('should throw ReleaseNotFoundError with correct message', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(404, null, 'Not Found'))

    await expect(fetchRelease('v0.0.0-nonexistent')).rejects.toThrow(
      'Release v0.0.0-nonexistent not found'
    )
  })

  it('should handle version without v prefix for non-existent release', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(404, null, 'Not Found'))

    // Without v prefix - should still normalize and throw ReleaseNotFoundError
    await expect(fetchRelease('0.0.0-nonexistent')).rejects.toThrow(
      ReleaseNotFoundError
    )
  })

  it('should throw GithubApiError on rate limit (403)', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(403, null, 'rate limit exceeded')
    )

    await expect(fetchRelease('v0.1.0')).rejects.toThrow(GithubApiError)
  })

  it('should throw GithubApiError on server error (500)', async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(500, null, 'Internal Server Error')
    )

    await expect(fetchRelease('v0.1.0')).rejects.toThrow(GithubApiError)
  })
})
