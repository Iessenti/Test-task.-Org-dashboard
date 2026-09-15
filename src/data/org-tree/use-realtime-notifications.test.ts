import { describe, expect, it, vi } from 'vitest';
import { REALTIME_NOTIFICATION_DURATION_MS } from './use-realtime-notifications';

describe('realtime notification timing', () => {
  it('uses the approved fifteen-second lifetime', () => {
    expect(REALTIME_NOTIFICATION_DURATION_MS).toBe(15_000);
    vi.useRealTimers();
  });
});
