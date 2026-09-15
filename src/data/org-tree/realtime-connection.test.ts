import { describe, expect, it, vi } from 'vitest';
import { createRealtimeConnection, REALTIME_STALE_TIMEOUT_MS, type RealtimeEventSource } from './realtime-connection';

function createFakeEventSource() {
  const source: RealtimeEventSource = {
    onopen: null,
    onerror: null,
    onmessage: null,
    close: vi.fn(),
  };
  return source;
}

describe('createRealtimeConnection', () => {
  it('reconnects when an open stream stops delivering events', () => {
    vi.useFakeTimers();
    const sources: RealtimeEventSource[] = [];
    const statuses: string[] = [];
    const connection = createRealtimeConnection({
      onStatusChange: (status) => statuses.push(status),
      onMessage: vi.fn(),
      eventSourceFactory: () => {
        const source = createFakeEventSource();
        sources.push(source);
        return source;
      },
    });

    sources[0].onopen?.();
    vi.advanceTimersByTime(REALTIME_STALE_TIMEOUT_MS - 1);
    expect(statuses).toEqual(['reconnecting', 'live']);
    vi.advanceTimersByTime(1);
    expect(statuses).toEqual(['reconnecting', 'live', 'reconnecting']);
    expect(sources[0].close).toHaveBeenCalledOnce();

    connection.close();
    vi.useRealTimers();
  });

  it('exposes initial, live, interrupted, recovered, and disposed states', () => {
    vi.useFakeTimers();
    const sources: RealtimeEventSource[] = [];
    const statuses: string[] = [];
    const messages: string[] = [];
    const connection = createRealtimeConnection({
      onStatusChange: (status) => statuses.push(status),
      onMessage: (data) => messages.push(data),
      eventSourceFactory: () => {
        const source = createFakeEventSource();
        sources.push(source);
        return source;
      },
    });

    expect(statuses).toEqual(['reconnecting']);
    sources[0].onopen?.();
    sources[0].onmessage?.({ data: '{"sequence":1}' });
    sources[0].onerror?.();
    vi.advanceTimersByTime(1_000);
    sources[1].onopen?.();
    expect(statuses).toEqual(['reconnecting', 'live', 'reconnecting', 'live']);
    expect(messages).toEqual(['{"sequence":1}']);

    connection.close();
    expect(statuses.at(-1)).toBe('offline');
    expect(sources[1].close).toHaveBeenCalledOnce();
    expect(sources[1].onopen).toBeNull();
    sources[1].onmessage?.({ data: 'ignored' });
    expect(messages).toEqual(['{"sequence":1}']);
    vi.useRealTimers();
  });

  it('does not close the source twice', () => {
    const source = createFakeEventSource();
    const connection = createRealtimeConnection({
      onStatusChange: vi.fn(),
      onMessage: vi.fn(),
      eventSourceFactory: () => source,
    });

    connection.close();
    connection.close();
    expect(source.close).toHaveBeenCalledOnce();
  });

  it('restarts with a resume event id', () => {
    const urls: string[] = [];
    const sources: RealtimeEventSource[] = [];
    const connection = createRealtimeConnection({
      onStatusChange: vi.fn(),
      onMessage: vi.fn(),
      eventSourceFactory: (url) => {
        urls.push(url);
        const source = createFakeEventSource();
        sources.push(source);
        return source;
      },
    });

    connection.restart('evt-7');

    expect(sources[0].close).toHaveBeenCalledOnce();
    expect(urls[1]).toBe('/api/org-tree/events?lastEventId=evt-7');
    connection.close();
  });

  it('reconnects with capped exponential delays, resets after recovery, and cancels on disposal', () => {
    vi.useFakeTimers();
    const sources: RealtimeEventSource[] = [];
    const connection = createRealtimeConnection({
      onStatusChange: vi.fn(),
      onMessage: vi.fn(),
      eventSourceFactory: () => {
        const source = createFakeEventSource();
        sources.push(source);
        return source;
      },
    });

    sources[0].onerror?.();
    vi.advanceTimersByTime(999);
    expect(sources).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(sources).toHaveLength(2);

    sources[1].onerror?.();
    vi.advanceTimersByTime(1_999);
    expect(sources).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(sources).toHaveLength(3);
    sources[2].onopen?.();

    sources[2].onerror?.();
    vi.advanceTimersByTime(999);
    expect(sources).toHaveLength(3);
    vi.advanceTimersByTime(1);
    expect(sources).toHaveLength(4);

    sources[3].onerror?.();
    connection.close();
    vi.advanceTimersByTime(60_000);
    expect(sources).toHaveLength(4);
    vi.useRealTimers();
  });
});
