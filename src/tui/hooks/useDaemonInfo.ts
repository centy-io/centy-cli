import { useState, useCallback, useEffect } from 'react'
import { daemonService } from '../services/daemon-service.js'
import type { DaemonInfo } from '../../daemon/types.js'

interface UseDaemonInfoParams {
  connected: boolean
}

export function useDaemonInfo({ connected }: UseDaemonInfoParams) {
  const [daemonInfo, setDaemonInfo] = useState<DaemonInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadDaemonInfo = useCallback(async () => {
    if (!connected) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const result = await daemonService.getDaemonInfo()
    if (result.success && result.data) {
      setDaemonInfo(result.data)
    }
    setIsLoading(false)
  }, [connected])

  useEffect(() => {
    loadDaemonInfo()
  }, [loadDaemonInfo])

  return {
    daemonInfo,
    isLoading,
  }
}
