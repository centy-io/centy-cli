import { describe, expect, it, vi } from 'vitest'
import { NotInitializedError } from './ensure-initialized.js'
import { handleNotInitializedWithSearch } from './handle-not-initialized-with-search.js'

describe('handleNotInitializedWithSearch', () => {
  it('returns null for non-NotInitializedError', async () => {
    const result = await handleNotInitializedWithSearch(
      new Error('other error'),
      {
        entityType: 'issue',
        identifier: 'test-id',
        jsonMode: false,
        globalSearchFn: vi.fn(),
      }
    )

    expect(result).toBeNull()
  })

  it('returns hint message when entity not found anywhere', async () => {
    const result = await handleNotInitializedWithSearch(
      new NotInitializedError('/test/path'),
      {
        entityType: 'issue',
        identifier: 'test-uuid',
        jsonMode: false,
        globalSearchFn: async () => ({ matches: [], errors: [] }),
      }
    )

    expect(result).not.toBeNull()
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.foundElsewhere).toBe(false)
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.message).toContain('No .centy folder found')
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.message).toContain('--global (-g)')
  })

  it('returns cross-project hint when entity found in other projects', async () => {
    const result = await handleNotInitializedWithSearch(
      new NotInitializedError('/test/path'),
      {
        entityType: 'issue',
        identifier: 'test-uuid',
        jsonMode: false,
        globalSearchFn: async () => ({
          matches: [
            { projectName: 'other-project', projectPath: '/other/path' },
          ],
          errors: [],
        }),
      }
    )

    expect(result).not.toBeNull()
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.foundElsewhere).toBe(true)
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.message).toContain('other-project')
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.message).toContain('--global')
  })

  it('returns JSON output when jsonMode is true and entity found', async () => {
    const result = await handleNotInitializedWithSearch(
      new NotInitializedError('/test/path'),
      {
        entityType: 'pr',
        identifier: 'test-uuid',
        jsonMode: true,
        globalSearchFn: async () => ({
          matches: [
            { projectName: 'other-project', projectPath: '/other/path' },
          ],
          errors: [],
        }),
      }
    )

    expect(result).not.toBeNull()
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.foundElsewhere).toBe(true)
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.jsonOutput).toBeDefined()
  })

  it('skips global search when shouldSearch returns false', async () => {
    const globalSearchFn = vi.fn()

    const result = await handleNotInitializedWithSearch(
      new NotInitializedError('/test/path'),
      {
        entityType: 'issue',
        identifier: 'not-a-uuid',
        jsonMode: false,
        globalSearchFn,
        shouldSearch: () => false,
      }
    )

    expect(globalSearchFn).not.toHaveBeenCalled()
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.foundElsewhere).toBe(false)
    // eslint-disable-next-line no-optional-chaining/no-optional-chaining
    expect(result?.message).toContain('--global (-g)')
  })

  it('performs global search when shouldSearch returns true', async () => {
    const globalSearchFn = vi
      .fn()
      .mockResolvedValue({ matches: [], errors: [] })

    await handleNotInitializedWithSearch(
      new NotInitializedError('/test/path'),
      {
        entityType: 'doc',
        identifier: 'test-slug',
        jsonMode: false,
        globalSearchFn,
        shouldSearch: () => true,
      }
    )

    expect(globalSearchFn).toHaveBeenCalled()
  })
})
