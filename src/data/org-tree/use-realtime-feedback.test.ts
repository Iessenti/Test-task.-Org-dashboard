import { describe, expect, it, vi } from 'vitest';
import { createRealtimeFeedbackController, REALTIME_FEEDBACK_DURATION_MS } from './use-realtime-feedback';

describe('createRealtimeFeedbackController', () => {
  it('starts, extends, and expires feedback without stale timers clearing it', () => {
    vi.useFakeTimers();
    const controller = createRealtimeFeedbackController();
    const cell = { nodeId: 'node-1', field: 'totalHeadcount' as const };

    controller.markUpdated([cell]);
    const firstToken = controller.getToken(cell.nodeId, cell.field);
    expect(controller.isActive(cell.nodeId, cell.field)).toBe(true);
    vi.advanceTimersByTime(REALTIME_FEEDBACK_DURATION_MS - 100);
    controller.markUpdated([cell]);
    const secondToken = controller.getToken(cell.nodeId, cell.field);
    expect(secondToken).toBeGreaterThan(firstToken!);
    vi.advanceTimersByTime(100);
    expect(controller.isActive(cell.nodeId, cell.field)).toBe(true);
    vi.advanceTimersByTime(REALTIME_FEEDBACK_DURATION_MS - 100);
    expect(controller.isActive(cell.nodeId, cell.field)).toBe(false);
    controller.dispose();
    vi.useRealTimers();
  });
});
