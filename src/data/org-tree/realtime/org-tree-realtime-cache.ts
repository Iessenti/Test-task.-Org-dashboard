import type { QueryClient } from '@tanstack/react-query';
import { ORG_TREE_QUERY_KEY, recordRealtimePatch } from '../resource/org-tree-query';
import { parseRealtimePatch, type RealtimeMetricPatch } from './org-tree-realtime';
import {
  createRealtimeReconciler,
  type RealtimePatchDecision,
  type RealtimeRecoveryRequest,
} from './realtime-reconciliation';
import { applyRealtimeMetricPatch } from './realtime-patch';
import { deriveRealtimeFeedback, type RealtimeFeedbackCell } from './realtime-feedback';
import type { OrgSnapshot } from '../model/org-tree-types';

export type RealtimeCacheUpdateResult =
  | { kind: 'applied'; patch: RealtimeMetricPatch; changedMetrics: string[]; affectedIds: string[]; feedbackCells: RealtimeFeedbackCell[] }
  | { kind: 'ignored'; decision: Extract<RealtimePatchDecision, { kind: 'ignore' }> }
  | { kind: 'recovery-required'; decision: Extract<RealtimePatchDecision, { kind: 'recover' }> }
  | { kind: 'invalid'; error: Error };

export function createRealtimeCacheUpdater(
  queryClient: QueryClient,
  onGap: (_request: RealtimeRecoveryRequest) => void = () => undefined,
) {
  const reconciler = createRealtimeReconciler({ onGap });

  return {
    applyPayload(payload: unknown): RealtimeCacheUpdateResult {
      const currentSnapshot = queryClient.getQueryData<OrgSnapshot>(ORG_TREE_QUERY_KEY);
      const knownNodeIds = new Set(Object.keys(currentSnapshot?.nodesById ?? {}));

      let patch: RealtimeMetricPatch;
      try {
        patch = parseRealtimePatch(payload, knownNodeIds);
      } catch (error) {
        return { kind: 'invalid', error: error instanceof Error ? error : new Error('Invalid realtime patch.') };
      }

      const decision = reconciler.acceptPatch(patch);
      if (decision.kind === 'ignore') return { kind: 'ignored', decision };
      if (decision.kind === 'recover') return { kind: 'recovery-required', decision };
      if (currentSnapshot === undefined) {
        return {
          kind: 'invalid',
          error: new Error('Cannot apply a realtime patch without an organization snapshot.'),
        };
      }

      recordRealtimePatch(patch);
      const transition = applyRealtimeMetricPatch(currentSnapshot, patch);
      if (transition.snapshot === currentSnapshot) {
        return { kind: 'applied', patch, changedMetrics: [], affectedIds: [], feedbackCells: [] };
      }

      queryClient.setQueryData(ORG_TREE_QUERY_KEY, transition.snapshot);
      return {
        kind: 'applied',
        patch,
        changedMetrics: transition.changedMetrics,
        affectedIds: transition.affectedIds,
        feedbackCells: deriveRealtimeFeedback(currentSnapshot, transition.snapshot, transition),
      };
    },
    acceptRecovery(sequence: number) {
      return reconciler.acceptRecovery(sequence);
    },
  };
}
