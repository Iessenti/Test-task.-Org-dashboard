import type { KeyboardEvent } from "react";
import type { OrgNodeDto } from "@/data/org-tree/model/org-tree-types";
import type { LayoutNode } from "@/features/organization-tree/model/canvas-layout";
import type { RealtimeFeedbackController } from "@/data/org-tree/hooks/use-realtime-feedback";
import type { OrgAggregate } from "@/data/org-tree/model/org-tree-types";
import { getAveragePerformance } from "@/data/org-tree/aggregation/org-tree-aggregation";
import { formatMetricNumber } from "@/data/org-tree/formatting/number-formatters";
import { BranchToggleIcon } from "./BranchToggleIcon";
import {
    Metric,
    MetricValue,
    MetricVisual,
    Metrics,
    NodeCard,
    NodeHeader,
    NodeName,
    NodeToggle,
    PerformanceScale,
    PerformanceValue,
    FeedbackValue,
    BranchReveal,
} from "@/features/organization-tree/containers/OrganizationTree.style";

function getPerformanceColor(performance: number) {
    if (performance < 50) return "#b42318";
    if (performance < 80) return "#9a6700";
    return "#067647";
}
function formatBudget(budget: number) {
    return new Intl.NumberFormat("ru-RU").format(budget);
}

export function OrganizationTreeNode({
    node,
    layout,
    renderedPosition,
    isExpanded,
    hasChildren,
    isPanning,
    isSelected,
    onToggle,
    onSelect,
    onClick,
    feedback,
    aggregate,
    isVisible,
}: {
    node: OrgNodeDto;
    aggregate: OrgAggregate;
    layout: LayoutNode;
    renderedPosition: LayoutNode;
    isExpanded: boolean;
    hasChildren: boolean;
    isPanning: boolean;
    isSelected: boolean;
    onToggle: () => void;
    onSelect: (_nodeId: string) => void;
    onClick: () => void;
    feedback: RealtimeFeedbackController;
    isVisible: boolean;
}) {
    const performanceColor = getPerformanceColor(node.performance);
    const averagePerformance = getAveragePerformance(aggregate);
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect(node.id);
    };
    return (
        <BranchReveal $isSelected={isSelected} $isVisible={isVisible} $x={renderedPosition.x} $y={renderedPosition.y}>
        <NodeCard
            key={node.id}
            data-node-id={node.id}
            $isPanning={isPanning}
            $isSelected={isSelected}
            aria-level={layout.depth + 1}
            aria-hidden={!isVisible}
            aria-selected={isSelected}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="treeitem"
            tabIndex={isVisible ? 0 : -1}
        >
            <NodeHeader>
                <NodeName>{node.name}</NodeName>
                {hasChildren && (
                    <NodeToggle
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={`${isExpanded ? "Свернуть" : "Развернуть"} ${node.name}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggle();
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                    >
                        <BranchToggleIcon isExpanded={isExpanded} />
                    </NodeToggle>
                )}
            </NodeHeader>
            <Metrics>
                <Metric>
                    <dt>Сотрудники</dt>
                    <MetricValue><FeedbackValue key={feedback.getToken(node.id, 'headcount')} $active={feedback.isActive(node.id, 'headcount')} $color="#18212f">{node.headcount}</FeedbackValue></MetricValue>
                </Metric>
                <Metric>
                    <dt>Бюджет</dt>
                    <MetricValue><FeedbackValue key={feedback.getToken(node.id, 'budget')} $active={feedback.isActive(node.id, 'budget')} $color="#18212f">{formatBudget(node.budget)} ₽</FeedbackValue></MetricValue>
                </Metric>
                <Metric>
                    <dt>Эффективность</dt>
                    <MetricVisual>
                        <PerformanceValue
                            $color={performanceColor}
                            aria-label={`Эффективность: ${node.performance}`}
                        >
                            <FeedbackValue key={feedback.getToken(node.id, 'performance')} $active={feedback.isActive(node.id, 'performance')} $color={performanceColor}>{formatMetricNumber(node.performance)}</FeedbackValue>
                        </PerformanceValue>
                        <PerformanceScale $color={performanceColor} $value={node.performance} aria-hidden="true" />
                    </MetricVisual>
                </Metric>
                {hasChildren && (
                    <Metric>
                        <dt>Средняя эффективность</dt>
                        <MetricVisual>
                            <PerformanceValue
                                $color={averagePerformance === null ? '#526176' : getPerformanceColor(averagePerformance)}
                                aria-label={`Средняя эффективность: ${averagePerformance ?? 'нет данных'}`}
                            >
                                <FeedbackValue key={feedback.getToken(node.id, 'averagePerformance')} $active={feedback.isActive(node.id, 'averagePerformance')} $color={averagePerformance === null ? '#526176' : getPerformanceColor(averagePerformance)}>
                                    {averagePerformance === null ? '—' : formatMetricNumber(averagePerformance)}
                                </FeedbackValue>
                            </PerformanceValue>
                            {averagePerformance !== null && <PerformanceScale $color={getPerformanceColor(averagePerformance)} $value={averagePerformance} aria-hidden="true" />}
                        </MetricVisual>
                    </Metric>
                )}
            </Metrics>
        </NodeCard>
        </BranchReveal>
    );
}
