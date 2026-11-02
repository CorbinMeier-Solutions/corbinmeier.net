/*
 * TurnstileGate™ - Corbin Meier Solutions
 * Licensed component. Modification permitted under your license agreement;
 * copying, redistribution, or removal of this notice is not.
 * This notice must remain intact in all copies and derivative works.
 */

import { describe, expect, it } from 'vitest'
import { deriveTurnstileStatus } from './useTurnstile'

describe('deriveTurnstileStatus', () => {
  it('is verifying until a token arrives', () => {
    expect(deriveTurnstileStatus('', false)).toBe('verifying')
  })
  it('is verified when a token is present', () => {
    expect(deriveTurnstileStatus('tok', false)).toBe('verified')
  })
  it('is failed after an error with no token', () => {
    expect(deriveTurnstileStatus('', true)).toBe('failed')
  })
  it('returns to verifying after expiry (token cleared, no failure)', () => {
    expect(deriveTurnstileStatus('', false)).toBe('verifying')
  })
})
