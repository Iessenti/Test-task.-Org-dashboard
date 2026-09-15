import { getAveragePerformance } from './org-tree-aggregation';
import type { RealtimePatchTransition } from './realtime-patch';
import type { OrgSnapshot } from './org-tree-validation';

export type RealtimeFeedbackField =
  | 'headcount'
  | 'budget'
  | 'performance'
  | 'totalHeadcount'
  | 'totalBudget'
  | 'averagePerformance';

export type RealtimeFeedbackCell = {
  nodeId: string;
  field: RealtimeFeedbackField;
};

export function deriveRealtimeFeedback(
  previousSnapshot: OrgSnapshot,
  nextSnapshot: OrgSnapshot,
  transition: RealtimePatchTransition,
): RealtimeFeedbackCell[] {
  if (nextSnapshot === previousSnapshot) return [];

  const feedback: RealtimeFeedbackCell[] = transition.changedMetrics.map((field) => ({
    nodeId: transition.affectedIds[0]!,
    field: field as 'headcount' | 'budget' | 'performance',
  }));

  for (const nodeId of transition.affectedIds) {
    const previousAggregate = previousSnapshot.aggregatesById[nodeId];
    const nextAggregate = nextSnapshot.aggregatesById[nodeId];
    if (previousAggregate === undefined || nextAggregate === undefined) continue;

    if (previousAggregate.totalHeadcount !== nextAggregate.totalHeadcount) {
      feedback.push({ nodeId, field: 'totalHeadcount' });
    }
    if (previousAggregate.totalBudget !== nextAggregate.totalBudget) {
      feedback.push({ nodeId, field: 'totalBudget' });
    }
    if (getAveragePerformance(previousAggregate) !== getAveragePerformance(nextAggregate)) {
      feedback.push({ nodeId, field: 'averagePerformance' });
    }
  }

  return feedback;
}
