import { useEffect, useRef, useState } from 'react';
import {
  createRealtimeConnection,
  type RealtimeConnection,
  type RealtimeConnectionStatus,
} from '../realtime/realtime-connection';

export function useRealtimeConnection({
  enabled,
  onMessage,
  onConnection,
}: {
  enabled: boolean;
  onMessage: (_data: string) => void;
  onConnection?: (_connection: RealtimeConnection) => void;
}): RealtimeConnectionStatus {
  const [status, setStatus] = useState<RealtimeConnectionStatus>('offline');
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) return undefined;

    const connection = createRealtimeConnection({
      onStatusChange: setStatus,
      onMessage: (data) => onMessageRef.current(data),
    });
    onConnection?.(connection);

    return () => connection.close();
  }, [enabled, onConnection]);

  return enabled ? status : 'offline';
}
