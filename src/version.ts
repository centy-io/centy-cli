import { createRequire } from 'node:module'
/**
 * Centy version constant, read from the package's own package.json.
 * Works from both src/ (tests) and dist/ (built CLI): both sit one level below the package root.
 */
const require = createRequire(import.meta.url)
const pkg: { version: string } = require('../package.json')

export const VERSION: string = pkg.version
