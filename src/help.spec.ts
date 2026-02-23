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
    interface HelpInstance {
      showRootHelp: () => Promise<void>
      log: (msg: string) => void
    }
    const instance: HelpInstance = Object.create(CentyHelp.prototype)

    let superCalled = false
    instance.log = (msg: string) => {
      logs.push(msg)
    }

    interface HelpProto {
      showRootHelp?: () => Promise<void>
    }
    const proto: HelpProto = Object.getPrototypeOf(CentyHelp.prototype)
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
