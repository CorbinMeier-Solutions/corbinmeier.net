/*
 * TurnstileGate™ - Corbin Meier Solutions
 * Licensed component. Modification permitted under your license agreement;
 * copying, redistribution, or removal of this notice is not.
 * This notice must remain intact in all copies and derivative works.
 */

import type { TurnstileStatus } from './useTurnstile'

const common = 'h-6 w-6 shrink-0'

interface TurnstileStatusIconProps {
  status: TurnstileStatus
  /** Merged onto the svg root. */
  className?: string
}

/** Spinner while verifying, check when verified, X when failed. Place beside the submit button. */
export default function TurnstileStatusIcon({ status, className = '' }: TurnstileStatusIconProps) {
  if (status === 'failed') {
    return (
      <svg role="img" aria-label="Spam check failed" viewBox="0 0 24 24" className={`${common} text-red-600 dark:text-red-400 ${className}`.trim()} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    )
  }
  if (status === 'verified') {
    return (
      <svg role="img" aria-label="Spam check passed" viewBox="0 0 24 24" className={`${common} text-emerald-600 dark:text-emerald-400 ${className}`.trim()} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    )
  }
  return (
    <svg role="img" aria-label="Spam check in progress" viewBox="0 0 24 24" className={`${common} animate-spin text-zinc-400 ${className}`.trim()} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}
