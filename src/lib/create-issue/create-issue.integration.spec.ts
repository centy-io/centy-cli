import { Writable } from 'node:stream'
import { vol } from 'memfs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CentyManifest } from '../../types/centy-manifest.js'
import { VERSION } from '../../version.js'

// Mock node:fs/promises with memfs
vi.mock('node:fs/promises', async () => {
  const memfs = await import('memfs')
  return memfs.fs.promises
})

// Import after mocking
const { createIssue } = await import('./create-issue.js')

// Helper to create a writable stream that collects output
function createOutputCollector(): {
  stream: Writable
  getOutput: () => string
} {
  let output = ''
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString()
      callback()
    },
  })
  return {
    stream,
    getOutput: () => output,
  }
}

// Helper to set up initialized .centy folder in memfs
function setupCentyFolder(projectPath: string): void {
  vol.mkdirSync(`${projectPath}/.centy/issues`, { recursive: true })
  vol.mkdirSync(`${projectPath}/.centy/docs`, { recursive: true })

  const manifest: CentyManifest = {
    schemaVersion: 1,
    centyVersion: VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    managedFiles: [
      {
        path: 'issues/',
        hash: '',
        version: VERSION,
        createdAt: new Date().toISOString(),
        type: 'directory',
      },
      {
        path: 'docs/',
        hash: '',
        version: VERSION,
        createdAt: new Date().toISOString(),
        type: 'directory',
      },
      {
        path: 'README.md',
        hash: 'abc123',
        version: VERSION,
        createdAt: new Date().toISOString(),
        type: 'file',
      },
    ],
  }

  vol.writeFileSync(
    `${projectPath}/.centy/.centy-manifest.json`,
    JSON.stringify(manifest, null, 2)
  )
  vol.writeFileSync(`${projectPath}/.centy/README.md`, '# .centy\n')
}

describe('createIssue integration tests', () => {
  beforeEach(() => {
    vol.reset()
  })

  describe('basic issue creation', () => {
    it('should create issue with title and description', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      const result = await createIssue({
        cwd: '/project',
        title: 'Test Issue',
        description: 'This is a test',
        output: collector.stream,
      })

      expect(result.success).toBe(true)
      expect(result.issueNumber).toBe('0001')

      // Verify issue.md
      const issueMd = vol.readFileSync(
        '/project/.centy/issues/0001/issue.md',
        'utf8'
      )
      expect(issueMd).toContain('# Test Issue')
      expect(issueMd).toContain('This is a test')
    })

    it('should create metadata.json with correct values', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      const result = await createIssue({
        cwd: '/project',
        title: 'High Priority Issue',
        description: '',
        priority: 'high',
        status: 'in-progress',
        output: collector.stream,
      })

      expect(result.success).toBe(true)

      const metadata = JSON.parse(
        vol.readFileSync(
          '/project/.centy/issues/0001/metadata.json',
          'utf8'
        ) as string
      )
      expect(metadata.status).toBe('in-progress')
      expect(metadata.priority).toBe('high')
      expect(metadata.createdAt).toBeDefined()
      expect(metadata.updatedAt).toBeDefined()
    })

    it('should create assets folder for the issue', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      await createIssue({
        cwd: '/project',
        title: 'Issue with assets',
        description: '',
        output: collector.stream,
      })

      expect(vol.existsSync('/project/.centy/issues/0001/assets')).toBe(true)
      const stat = vol.statSync('/project/.centy/issues/0001/assets')
      expect(stat.isDirectory()).toBe(true)
    })

    it('should use default priority and status', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      await createIssue({
        cwd: '/project',
        title: 'Default values issue',
        description: '',
        output: collector.stream,
      })

      const metadata = JSON.parse(
        vol.readFileSync(
          '/project/.centy/issues/0001/metadata.json',
          'utf8'
        ) as string
      )
      expect(metadata.status).toBe('open')
      expect(metadata.priority).toBe('medium')
    })
  })

  describe('issue numbering', () => {
    it('should increment issue numbers', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      await createIssue({
        cwd: '/project',
        title: 'First',
        description: '',
        output: collector.stream,
      })
      await createIssue({
        cwd: '/project',
        title: 'Second',
        description: '',
        output: collector.stream,
      })
      const result = await createIssue({
        cwd: '/project',
        title: 'Third',
        description: '',
        output: collector.stream,
      })

      expect(result.issueNumber).toBe('0003')

      const entries = vol.readdirSync('/project/.centy/issues')
      expect(entries).toContain('0001')
      expect(entries).toContain('0002')
      expect(entries).toContain('0003')
    })
  })

  describe('error handling', () => {
    it('should fail if .centy not initialized', async () => {
      vol.mkdirSync('/empty-project', { recursive: true })
      const collector = createOutputCollector()

      const result = await createIssue({
        cwd: '/empty-project',
        title: 'Test',
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not initialized')
    })

    it('should fail without title', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      const result = await createIssue({
        cwd: '/project',
        title: '',
        description: '',
        output: collector.stream,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('title is required')
    })
  })

  describe('manifest handling', () => {
    it('should update manifest with new files', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      await createIssue({
        cwd: '/project',
        title: 'Manifest Test',
        description: '',
        output: collector.stream,
      })

      const manifestContent = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(manifestContent as string)

      const paths = manifest.managedFiles.map(f => f.path)
      expect(paths).toContain('issues/0001/issue.md')
      expect(paths).toContain('issues/0001/metadata.json')
      expect(paths).toContain('issues/0001/assets/')
    })

    it('should include hashes for files in manifest', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      await createIssue({
        cwd: '/project',
        title: 'Hash Test',
        description: '',
        output: collector.stream,
      })

      const manifestContent = vol.readFileSync(
        '/project/.centy/.centy-manifest.json',
        'utf8'
      )
      const manifest: CentyManifest = JSON.parse(manifestContent as string)

      const issueMdEntry = manifest.managedFiles.find(
        f => f.path === 'issues/0001/issue.md'
      )
      expect(issueMdEntry).toBeDefined()
      if (issueMdEntry) {
        expect(issueMdEntry.hash).toBeDefined()
        expect(issueMdEntry.hash.length).toBeGreaterThan(0)
      }

      const metadataEntry = manifest.managedFiles.find(
        f => f.path === 'issues/0001/metadata.json'
      )
      expect(metadataEntry).toBeDefined()
      if (metadataEntry) {
        expect(metadataEntry.hash).toBeDefined()
        expect(metadataEntry.hash.length).toBeGreaterThan(0)
      }
    })
  })

  describe('config handling', () => {
    it('should use defaults from config.json', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      // Create config with custom defaults
      const config = {
        issues: {
          defaultStatus: 'backlog',
          defaultPriority: 'low',
        },
      }
      vol.writeFileSync(
        '/project/.centy/config.json',
        JSON.stringify(config, null, 2)
      )

      await createIssue({
        cwd: '/project',
        title: 'Config Test',
        description: '',
        output: collector.stream,
      })

      const metadata = JSON.parse(
        vol.readFileSync(
          '/project/.centy/issues/0001/metadata.json',
          'utf8'
        ) as string
      )
      expect(metadata.status).toBe('backlog')
      expect(metadata.priority).toBe('low')
    })

    it('should apply custom field defaults from config', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      // Create config with custom fields
      const config = {
        issues: {
          customFields: {
            assignee: { type: 'string', default: 'unassigned' },
            labels: { type: 'array', default: ['new'] },
          },
        },
      }
      vol.writeFileSync(
        '/project/.centy/config.json',
        JSON.stringify(config, null, 2)
      )

      await createIssue({
        cwd: '/project',
        title: 'Custom Fields Test',
        description: '',
        output: collector.stream,
      })

      const metadata = JSON.parse(
        vol.readFileSync(
          '/project/.centy/issues/0001/metadata.json',
          'utf8'
        ) as string
      )
      expect(metadata.assignee).toBe('unassigned')
      expect(metadata.labels).toEqual(['new'])
    })
  })

  describe('output messages', () => {
    it('should output success message with paths', async () => {
      vol.mkdirSync('/project', { recursive: true })
      setupCentyFolder('/project')
      const collector = createOutputCollector()

      await createIssue({
        cwd: '/project',
        title: 'Output Test',
        description: '',
        output: collector.stream,
      })

      const output = collector.getOutput()
      expect(output).toContain('Created issue #0001')
      expect(output).toContain('issue.md')
      expect(output).toContain('metadata.json')
    })
  })
})
