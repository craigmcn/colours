import { useState, useCallback } from 'react'

export const useClipboard = (timeout = 1200) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = useCallback((text: string, key: string) => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), timeout)
    })
  }, [timeout])

  const isSupported = typeof navigator !== 'undefined' && !!navigator.clipboard

  return { copy, copiedKey, isSupported }
}
