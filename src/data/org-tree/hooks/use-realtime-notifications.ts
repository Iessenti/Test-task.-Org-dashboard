import { useCallback, useEffect, useRef, useState } from 'react';

export const REALTIME_NOTIFICATION_DURATION_MS = 15_000;

export type RealtimeNotification = {
  id: number;
  message: string;
};

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) clearTimeout(timer);
    timers.current.delete(id);
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const notify = useCallback((message: string) => {
    const id = nextId.current;
    nextId.current += 1;
    setNotifications((current) => [...current, { id, message }]);
    timers.current.set(id, setTimeout(() => dismiss(id), REALTIME_NOTIFICATION_DURATION_MS));
  }, [dismiss]);

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
  }, []);

  return { dismiss, notifications, notify };
}
