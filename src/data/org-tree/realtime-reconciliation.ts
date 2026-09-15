import type { OrgNodeDto } from './org-tree-validation';
import type { RealtimeMetricPatch } from './org-tree-realtime';

export type RealtimePatchDecision =
  | { kind: 'apply'; renewsFreshness: true }
  | { kind: 'ignore'; reason: 'stale' | 'recovering' }
  | { kind: 'recover'; lastAppliedSequence: number; receivedSequence: number; lastEventId: string };

export type RealtimeRecoveryRequest = {
  lastAppliedSequence: number;
  receivedSequence: number;
  lastEventId: string;
};

export type RealtimeRecoveryResult = {
  resumeFromEventId: string;
  sequence: number;
};

export function createRealtimeReconciler({
  onGap,
}: {
  onGap: (_request: RealtimeRecoveryRequest) => void;
}) {
  let lastAppliedSequence = 0;
  let hasEstablishedStreamPosition = false;
  let recovering = false;
  let lastAppliedEventId: string | undefined;
  const latestPatchUpdatedAtByNode = new Map<string, string>();

  return {
    acceptPatch(patch: RealtimeMetricPatch): RealtimePatchDecision {
      // The server sequence is global, so the first event after a full page
      // load may legitimately be ahead of zero. It establishes this stream's
      // starting position; gaps are still detected after the first event.
      if (!hasEstablishedStreamPosition) {
        hasEstablishedStreamPosition = true;
        lastAppliedSequence = patch.sequence - 1;
      }

      if (patch.sequence <= lastAppliedSequence) {
        return { kind: 'ignore', reason: 'stale' };
      }

      if (recovering || patch.sequence !== lastAppliedSequence + 1) {
        if (recovering) {
          return { kind: 'ignore', reason: 'recovering' };
        }

        if (!recovering) {
          recovering = true;
          onGap({
            lastAppliedSequence,
            receivedSequence: patch.sequence,
            lastEventId: lastAppliedEventId ?? `evt-${lastAppliedSequence}`,
          });
        }
        return { kind: 'recover', lastAppliedSequence, receivedSequence: patch.sequence, lastEventId: lastAppliedEventId ?? `evt-${lastAppliedSequence}` };
      }

      lastAppliedSequence = patch.sequence;
      lastAppliedEventId = patch.eventId;
      latestPatchUpdatedAtByNode.set(patch.nodeId, patch.updatedAt);
      return { kind: 'apply', renewsFreshness: true };
    },

    acceptRecovery(sequence: number): RealtimeRecoveryResult {
      if (!Number.isInteger(sequence) || sequence < lastAppliedSequence) {
        throw new Error('Realtime recovery sequence must not move backwards.');
      }

      lastAppliedSequence = sequence;
      recovering = false;
      return {
        resumeFromEventId: `evt-${sequence}`,
        sequence,
      };
    },

    shouldUseFullResponseNode(node: OrgNodeDto): boolean {
      const latestPatchUpdatedAt = latestPatchUpdatedAtByNode.get(node.id);
      return latestPatchUpdatedAt === undefined || node.updatedAt >= latestPatchUpdatedAt;
    },

    getLastAppliedSequence(): number {
      return lastAppliedSequence;
    },
  };
}
