import type { RealtimeMetricPatch } from './org-tree-realtime';

const latestRealtimeUpdatedAtByNode = new Map<string, string>();

export function recordRealtimePatch(patch: RealtimeMetricPatch) {
  latestRealtimeUpdatedAtByNode.set(patch.nodeId, patch.updatedAt);
}

export function clearRealtimePatchWatermarks() {
  latestRealtimeUpdatedAtByNode.clear();
}

export function getRealtimePatchWatermarks(): ReadonlyMap<string, string> {
  return latestRealtimeUpdatedAtByNode;
}
