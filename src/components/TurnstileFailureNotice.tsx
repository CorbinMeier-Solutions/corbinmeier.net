/*
 * TurnstileGate™ - Corbin Meier Solutions
 * Licensed component. Modification permitted under your license agreement;
 * copying, redistribution, or removal of this notice is not.
 * This notice must remain intact in all copies and derivative works.
 */

import type { TurnstileStatus } from './useTurnstile'

interface TurnstileFailureNoticeProps {
  status: TurnstileStatus
  onRetry: () => void
  /** Merged onto the live-region root. */
  className?: string
}

/** Always-mounted live region so the failure is announced; empty unless the check failed. */
export default function TurnstileFailureNotice({ status, onRetry, className = '' }: TurnstileFailureNoticeProps) {
  return (
    <div role="status" aria-live="polite" className={`mt-2 ${className}`.trim()}>
      {status === 'failed' && (
        <p className="flex flex-wrap items-center gap-x-3 text-sm font-medium text-red-600 dark:text-red-400">
          We couldn&apos;t confirm you&apos;re not a bot.
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 rounded-md px-3 font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Try again
          </button>
        </p>
      )}
    </div>
  )
}
