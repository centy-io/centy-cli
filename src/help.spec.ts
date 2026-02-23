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

  it('should show LLM callout before root help content', async () => {
    const logs: string[] = []
    const instance = Object.create(CentyHelp.prototype) as {
      showRootHelp: () => Promise<void>
      log: (msg: string) => void
    }

    let superCalled = false
    instance.log = (msg: string) => {
      logs.push(msg)
    }

    const proto = Object.getPrototypeOf(CentyHelp.prototype) as {
      showRootHelp?: () => Promise<void>
    }
    if (proto.showRootHelp) {
      proto.showRootHelp = async () => {
        superCalled = true
      }
    }

    // Patch prototype temporarily
    const original = Object.getPrototypeOf(CentyHelp.prototype).showRootHelp
    Object.getPrototypeOf(CentyHelp.prototype).showRootHelp = async () => {
      superCalled = true
    }

    await instance.showRootHelp()

    Object.getPrototypeOf(CentyHelp.prototype).showRootHelp = original

    const llmLineIndex = logs.findIndex(log => log.includes('centy llm'))
    expect(llmLineIndex).toBeGreaterThanOrEqual(0)
    expect(llmLineIndex).toBe(0)
    expect(superCalled).toBe(true)
  })
})
