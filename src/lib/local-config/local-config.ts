/* eslint-disable single-export/single-export */
import Conf from 'conf'

export interface LocalConfig {
  preferredProject?: string
}

const schema = {
  preferredProject: {
    type: 'string',
  },
} satisfies Record<keyof LocalConfig, { type: string }>

let store: Conf<LocalConfig> | undefined

function getStore(): Conf<LocalConfig> {
  if (store === undefined) {
    store = new Conf<LocalConfig>({
      projectName: 'centy',
      schema,
    })
  }
  return store
}

export function getLocalConfig(): LocalConfig {
  return getStore().store
}

export function setLocalConfigValue<K extends keyof LocalConfig>(
  key: K,
  value: NonNullable<LocalConfig[K]>
): void {
  getStore().set(key, value)
}

export function getLocalConfigValue<K extends keyof LocalConfig>(
  key: K,
  defaultValue: NonNullable<LocalConfig[K]>
): NonNullable<LocalConfig[K]> {
  // eslint-disable-next-line no-restricted-syntax
  return getStore().get(key, defaultValue) as NonNullable<LocalConfig[K]>
}

export function deleteLocalConfigValue(key: keyof LocalConfig): void {
  getStore().delete(key)
}

export function clearLocalConfig(): void {
  getStore().clear()
}

export function resetStoreForTesting(): void {
  store = undefined
}
