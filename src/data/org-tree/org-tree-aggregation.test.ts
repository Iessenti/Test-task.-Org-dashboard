import { describe, expect, it } from 'vitest';
import { calculateOrgAggregates, getAveragePerformance, recalculateOrgAggregateChain } from './org-tree-aggregation';
import type { OrgNodeDto } from './org-tree-validation';

function node(id: string, parentId: string | null, headcount: number, budget: number, performance: number): OrgNodeDto {
  return { id, name: id, parentId, headcount, budget, performance, updatedAt: '2026-09-15T00:00:00.000Z' };
}

function indexes(nodes: OrgNodeDto[]) {
  const nodesById: Record<string, OrgNodeDto> = {};
  const childrenByParentId: Record<string, string[]> = {};

  for (const currentNode of nodes) {
    nodesById[currentNode.id] = currentNode;
    childrenByParentId[currentNode.id] = [];
  }
  for (const currentNode of nodes) {
    if (currentNode.parentId !== null) childrenByParentId[currentNode.parentId]?.push(currentNode.id);
  }

  return { nodesById, childrenByParentId };
}

describe('calculateOrgAggregates', () => {
  it('returns a leaf raw contribution', () => {
    const result = calculateOrgAggregates(indexes([node('leaf', null, 4, 1250, 80)]));

    expect(result).toEqual({
      leaf: { totalHeadcount: 4, totalBudget: 1250, weightedPerformanceSum: 320 },
    });
  });

  it('aggregates an internal node from its own and descendant contributions', () => {
    const result = calculateOrgAggregates(indexes([
      node('root', null, 2, 100, 50),
      node('child', 'root', 3, 200, 80),
      node('grandchild', 'child', 5, 300, 60),
    ]));

    expect(result.root).toEqual({ totalHeadcount: 10, totalBudget: 600, weightedPerformanceSum: 640 });
    expect(result.child).toEqual({ totalHeadcount: 8, totalBudget: 500, weightedPerformanceSum: 540 });
  });

  it('aggregates multiple branches independently and at the root', () => {
    const result = calculateOrgAggregates(indexes([
      node('root', null, 1, 10, 100),
      node('left', 'root', 2, 20, 50),
      node('right', 'root', 3, 30, 0),
      node('right-child', 'right', 4, 40, 25),
    ]));

    expect(result.left).toEqual({ totalHeadcount: 2, totalBudget: 20, weightedPerformanceSum: 100 });
    expect(result.right).toEqual({ totalHeadcount: 7, totalBudget: 70, weightedPerformanceSum: 100 });
    expect(result.root).toEqual({ totalHeadcount: 10, totalBudget: 100, weightedPerformanceSum: 300 });
  });

  it('supports multiple roots and is independent of input order', () => {
    const nodes = [
      node('root-a', null, 2, 10, 50),
      node('child-a', 'root-a', 1, 20, 100),
      node('root-b', null, 4, 40, 25),
    ];

    const forward = calculateOrgAggregates(indexes(nodes));
    const reversed = calculateOrgAggregates(indexes([...nodes].reverse()));

    expect(forward).toEqual(reversed);
    expect(forward['root-a']).toEqual({ totalHeadcount: 3, totalBudget: 30, weightedPerformanceSum: 200 });
    expect(forward['root-b']).toEqual({ totalHeadcount: 4, totalBudget: 40, weightedPerformanceSum: 100 });
  });

  it('returns no numeric average when total headcount is zero', () => {
    const result = calculateOrgAggregates(indexes([
      node('root', null, 0, 100, 75),
      node('child', 'root', 0, 50, 25),
    ]));

    expect(result.root).toEqual({ totalHeadcount: 0, totalBudget: 150, weightedPerformanceSum: 0 });
    expect(getAveragePerformance(result.root!)).toBeNull();
  });

  it('derives average performance from the weighted sum', () => {
    expect(getAveragePerformance({ totalHeadcount: 8, totalBudget: 0, weightedPerformanceSum: 540 })).toBe(67.5);
  });
});

describe('recalculateOrgAggregateChain', () => {
  it('recomputes a leaf and its ancestors after simultaneous metric changes', () => {
    const nodes = [
      node('root', null, 2, 100, 50),
      node('branch', 'root', 3, 200, 80),
      node('leaf', 'branch', 5, 300, 60),
      node('unrelated', 'root', 4, 400, 40),
    ];
    const indexesResult = indexes(nodes);
    const previous = calculateOrgAggregates(indexesResult);
    const changedNodes = {
      ...indexesResult.nodesById,
      leaf: { ...indexesResult.nodesById.leaf, headcount: 8, performance: 90 },
    };

    const result = recalculateOrgAggregateChain({
      ...indexesResult,
      nodesById: changedNodes,
      aggregatesById: previous,
      targetId: 'leaf',
    });

    expect(result.affectedIds).toEqual(['leaf', 'branch', 'root']);
    expect(result.aggregatesById.leaf).toEqual({ totalHeadcount: 8, totalBudget: 300, weightedPerformanceSum: 720 });
    expect(result.aggregatesById.branch).toEqual({ totalHeadcount: 11, totalBudget: 500, weightedPerformanceSum: 960 });
    expect(result.aggregatesById.root).toEqual({ totalHeadcount: 17, totalBudget: 1000, weightedPerformanceSum: 1220 });
    expect(result.aggregatesById.unrelated).toBe(previous.unrelated);
  });

  it('supports repeated updates and zero-headcount subtrees without affecting other roots', () => {
    const nodes = [
      node('root-a', null, 1, 10, 50),
      node('zero', 'root-a', 0, 20, 100),
      node('root-b', null, 4, 40, 25),
    ];
    const indexesResult = indexes(nodes);
    const initial = calculateOrgAggregates(indexesResult);
    const first = recalculateOrgAggregateChain({
      ...indexesResult,
      nodesById: {
        ...indexesResult.nodesById,
        zero: { ...indexesResult.nodesById.zero, budget: 30 },
      },
      aggregatesById: initial,
      targetId: 'zero',
    });
    const second = recalculateOrgAggregateChain({
      ...indexesResult,
      nodesById: {
        ...indexesResult.nodesById,
        zero: { ...indexesResult.nodesById.zero, budget: 35 },
      },
      aggregatesById: first.aggregatesById,
      targetId: 'zero',
    });

    expect(getAveragePerformance(second.aggregatesById.zero)).toBeNull();
    expect(second.aggregatesById['root-a']).toEqual({ totalHeadcount: 1, totalBudget: 45, weightedPerformanceSum: 50 });
    expect(second.aggregatesById['root-b']).toBe(initial['root-b']);
  });
});
