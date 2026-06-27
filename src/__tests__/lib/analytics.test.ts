import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendGAEvent = vi.hoisted(() => vi.fn());

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent,
}));

import { trackEvent, isAnalyticsEnabled, GA_MEASUREMENT_ID } from '@/lib/analytics';

describe('analytics', () => {
  beforeEach(() => {
    sendGAEvent.mockClear();
  });

  it('is disabled when no measurement id is configured', () => {
    // Test env does not set NEXT_PUBLIC_GA_MEASUREMENT_ID.
    expect(GA_MEASUREMENT_ID).toBe('');
    expect(isAnalyticsEnabled).toBe(false);
  });

  it('is a no-op when analytics is disabled', () => {
    trackEvent('lead_enviado', { plan: 'pro' });
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it('does not throw when called without params', () => {
    expect(() => trackEvent('checkout_iniciado')).not.toThrow();
  });
});
