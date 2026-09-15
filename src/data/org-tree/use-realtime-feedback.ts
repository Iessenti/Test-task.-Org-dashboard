import { useEffect, useReducer, useState } from 'react';
import type { RealtimeFeedbackCell, RealtimeFeedbackField } from './realtime-feedback';

export const REALTIME_FEEDBACK_DURATION_MS = 1_500;
type FeedbackKey = string;

function getFeedbackKey(nodeId: string, field: RealtimeFeedbackField): FeedbackKey {
  return `${nodeId}:${field}`;
}

export type RealtimeFeedbackController = {
  getToken: (_nodeId: string, _field: RealtimeFeedbackField) => number | null;
  isActive: (_nodeId: string, _field: RealtimeFeedbackField) => boolean;
  markUpdated: (_cells: RealtimeFeedbackCell[]) => void;
  dispose: () => void;
};

export function createRealtimeFeedbackController(onChange: () => void = () => undefined): RealtimeFeedbackController {
  const expiresAtByKey = new Map<FeedbackKey, number>();
  const timers = new Map<FeedbackKey, ReturnType<typeof setTimeout>>();

  const markUpdated = (cells: RealtimeFeedbackCell[]) => {
    const now = Date.now();
    for (const cell of cells) {
      const key = getFeedbackKey(cell.nodeId, cell.field);
      const expiresAt = now + REALTIME_FEEDBACK_DURATION_MS;
      const previousTimer = timers.get(key);
      if (previousTimer !== undefined) clearTimeout(previousTimer);
      expiresAtByKey.set(key, expiresAt);
      timers.set(key, setTimeout(() => {
        if (expiresAtByKey.get(key) === expiresAt) {
          expiresAtByKey.delete(key);
          onChange();
        }
        timers.delete(key);
      }, REALTIME_FEEDBACK_DURATION_MS));
    }
    onChange();
  };

  return {
    markUpdated,
    getToken: (nodeId, field) => expiresAtByKey.get(getFeedbackKey(nodeId, field)) ?? null,
    isActive: (nodeId, field) => expiresAtByKey.has(getFeedbackKey(nodeId, field)),
    dispose: () => {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      expiresAtByKey.clear();
    },
  };
}

export function useRealtimeFeedback(): RealtimeFeedbackController {
  const [, forceRender] = useReducer((version) => version + 1, 0);
  const [controller] = useState(() => createRealtimeFeedbackController(forceRender));

  useEffect(() => () => controller.dispose(), [controller]);

  return controller;
}
