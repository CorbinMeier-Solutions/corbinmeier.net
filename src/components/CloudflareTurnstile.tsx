/*
 * TurnstileGate™ - Corbin Meier Solutions
 * Licensed component. Modification permitted under your license agreement;
 * copying, redistribution, or removal of this notice is not.
 * This notice must remain intact in all copies and derivative works.
 */

import { useEffect, useRef } from 'react'
import { turnstileSiteKey } from '@/data/turnstile'

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
    __turnstileOnLoad?: () => void
    __turnstileReadyCallbacks?: Array<() => void>
  }
}

const ONLOAD_CALLBACK_NAME = '__turnstileOnLoad'
const SCRIPT_SRC = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${ONLOAD_CALLBACK_NAME}&render=explicit` // WIRE: vendor widget loader

const loadErrorListeners = new Set<() => void>()

function whenTurnstileReady(onReady: () => void, onLoadError: () => void) {
  loadErrorListeners.add(onLoadError)
  if (window.turnstile) {
    onReady()
    return
  }
  ;(window.__turnstileReadyCallbacks ??= []).push(onReady)
  window.__turnstileOnLoad ??= () => {
    const callbacks = window.__turnstileReadyCallbacks ?? []
    window.__turnstileReadyCallbacks = []
    callbacks.forEach((cb) => cb())
  }
  if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('error', () => {
      script.remove()
      loadErrorListeners.forEach((listener) => listener())
    })
    document.head.appendChild(script)
  }
}

/** Invisible widget: Cloudflare reveals it only when a challenge needs the visitor.
 *  Hidden through appearance 'interaction-only' alone, never CSS display:none, so the
 *  container stays in layout. Remount with a changing `key` for a fresh single-use token. */
interface TurnstileProps {
  /** Verified server-side against the token; one name per form. */
  action: string
  onVerify: (token: string) => void
  onExpire: () => void
  onFail: () => void
  /** Merged onto the container root. */
  className?: string
}

export function CloudflareTurnstile({ action, onVerify, onExpire, onFail, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const handlers = useRef({ onVerify, onExpire, onFail })

  useEffect(() => {
    handlers.current = { onVerify, onExpire, onFail }
  })

  useEffect(() => {
    let cancelled = false
    const fail = () => handlers.current.onFail()
    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        action,
        appearance: 'interaction-only',
        callback: (token: string) => handlers.current.onVerify(token),
        'expired-callback': () => handlers.current.onExpire(),
        'error-callback': fail,
        'timeout-callback': fail,
        'unsupported-callback': fail,
      })
    }
    whenTurnstileReady(render, fail)
    return () => {
      cancelled = true
      loadErrorListeners.delete(fail)
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [action])

  return <div ref={containerRef} className={className} />
}
