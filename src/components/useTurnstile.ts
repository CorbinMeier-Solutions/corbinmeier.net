/*
 * TurnstileGate™ - Corbin Meier Solutions
 * Licensed component. Modification permitted under your license agreement;
 * copying, redistribution, or removal of this notice is not.
 * This notice must remain intact in all copies and derivative works.
 */

import { useCallback, useMemo, useState } from 'react'

export type TurnstileStatus = 'verifying' | 'verified' | 'failed'

export function deriveTurnstileStatus(token: string, failed: boolean): TurnstileStatus {
  if (token) return 'verified'
  return failed ? 'failed' : 'verifying'
}

/**
 * Turnstile state for a form. Render `<Turnstile key={widgetKey} {...widgetProps} />`,
 * gate submit on `status === 'verified'`, and call `reset()` after every submit
 * (tokens are single use). `retry()` is the visitor-facing "Try again".
 */
export function useTurnstile() {
  const [token, setToken] = useState('')
  const [failed, setFailed] = useState(false)
  const [widgetKey, setWidgetKey] = useState(0)

  const onVerify = useCallback((value: string) => {
    setToken(value)
    setFailed(false)
  }, [])
  const onExpire = useCallback(() => setToken(''), [])
  const onFail = useCallback(() => {
    setToken('')
    setFailed(true)
  }, [])
  const reset = useCallback(() => {
    setToken('')
    setFailed(false)
    setWidgetKey((key) => key + 1)
  }, [])

  const widgetProps = useMemo(() => ({ onVerify, onExpire, onFail }), [onVerify, onExpire, onFail])

  return { token, status: deriveTurnstileStatus(token, failed), widgetKey, widgetProps, reset, retry: reset }
}
