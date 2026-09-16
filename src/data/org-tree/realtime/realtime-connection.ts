export type RealtimeConnectionStatus = 'live' | 'reconnecting' | 'offline';

export type RealtimeMessageEvent = {
  data: string;
};

export type RealtimeEventSource = {
  onopen: (() => void) | null;
  onerror: (() => void) | null;
  onmessage: ((_event: RealtimeMessageEvent) => void) | null;
  close: () => void;
};

export type RealtimeEventSourceFactory = (_url: string) => RealtimeEventSource;
export type RealtimeConnection = { close: () => void; restart: (_lastEventId?: string) => void };

export const REALTIME_RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000];
export const REALTIME_STALE_TIMEOUT_MS = 15_000;

export function createRealtimeConnection({
  onStatusChange,
  onMessage,
  eventSourceFactory = (url) => new EventSource(url),
}: {
  onStatusChange: (_status: RealtimeConnectionStatus) => void;
  onMessage: (_data: string) => void;
  eventSourceFactory?: RealtimeEventSourceFactory;
}): RealtimeConnection {
  let disposed = false;
  let source: RealtimeEventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let staleTimer: ReturnType<typeof setTimeout> | undefined;
  let retryIndex = 0;
  let resumeEventId: string | undefined;

  onStatusChange('reconnecting');

  const clearReconnectTimer = () => {
    if (reconnectTimer !== undefined) {
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }
  };

  const clearStaleTimer = () => {
    if (staleTimer !== undefined) {
      clearTimeout(staleTimer);
      staleTimer = undefined;
    }
  };

  const closeSource = () => {
    if (source === null) return;
    source.onopen = null;
    source.onerror = null;
    source.onmessage = null;
    source.close();
    source = null;
  };

  const scheduleReconnect = () => {
    if (disposed || reconnectTimer !== undefined) return;
    onStatusChange('reconnecting');
    const delay = REALTIME_RECONNECT_DELAYS_MS[Math.min(retryIndex, REALTIME_RECONNECT_DELAYS_MS.length - 1)];
    retryIndex += 1;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      connect();
    }, delay);
  };

  const handleDisconnect = () => {
    if (disposed || reconnectTimer !== undefined) return;
    clearStaleTimer();
    closeSource();
    scheduleReconnect();
  };

  const scheduleStaleTimeout = () => {
    clearStaleTimer();
    staleTimer = setTimeout(handleDisconnect, REALTIME_STALE_TIMEOUT_MS);
  };

  const connect = () => {
    if (disposed) return;

    const url = resumeEventId === undefined
      ? '/api/org-tree/events'
      : `/api/org-tree/events?lastEventId=${encodeURIComponent(resumeEventId)}`;
    source = eventSourceFactory(url);
    source.onopen = () => {
      if (disposed) return;
      retryIndex = 0;
      onStatusChange('live');
      scheduleStaleTimeout();
    };
    source.onerror = handleDisconnect;
    source.onmessage = (event) => {
      if (disposed) return;
      scheduleStaleTimeout();
      try {
        if ((JSON.parse(event.data) as { type?: string }).type === 'heartbeat') return;
      } catch {
        // Forward malformed application payloads for validation at the data boundary.
      }
      onMessage(event.data);
    };
  };

  connect();

  return {
    close() {
      if (disposed) return;
      disposed = true;
      clearReconnectTimer();
      clearStaleTimer();
      closeSource();
      onStatusChange('offline');
    },
    restart(lastEventId) {
      if (disposed) return;
      clearReconnectTimer();
      clearStaleTimer();
      closeSource();
      resumeEventId = lastEventId;
      connect();
    },
  };
}
