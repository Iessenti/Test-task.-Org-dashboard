export type OrgNodeDto = {
  id: string;
  name: string;
  parentId: string | null;
  headcount: number;
  budget: number;
  performance: number;
  updatedAt: string;
};

export type OrgAggregate = {
  totalHeadcount: number;
  totalBudget: number;
  weightedPerformanceSum: number;
};

export type OrgSnapshot = {
  nodesById: Record<string, OrgNodeDto>;
  rootIds: string[];
  childrenByParentId: Record<string, string[]>;
  depthById: Record<string, number>;
  aggregatesById: Record<string, OrgAggregate>;
};
