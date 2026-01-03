import { describe, expect, it } from 'vitest'
import CentyHelp from './help.js'

describe('CentyHelp', () => {
  it('should extend Help class', () => {
    expect(CentyHelp).toBeDefined()
    expect(typeof CentyHelp).toBe('function')
  })

  it('should have showRootHelp method', () => {
    expect(CentyHelp.prototype.showRootHelp).toBeDefined()
  })
})
