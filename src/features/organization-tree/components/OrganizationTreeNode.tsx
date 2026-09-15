import type { KeyboardEvent } from "react";
import type { OrgNodeDto } from "@/data/org-tree/org-tree-validation";
import type { LayoutNode } from "@/features/organization-tree/model/canvas-layout";
import { formatMetricNumber } from "@/data/org-tree/number-formatters";
import { BranchToggleIcon } from "./BranchToggleIcon";
import {
    Metric,
    MetricValue,
    Metrics,
    NodeCard,
    NodeHeader,
    NodeName,
    NodeToggle,
    PerformanceScale,
    PerformanceValue,
} from "@/features/organization-tree/containers/OrganizationTree.style";

function getPerformanceBand(performance: number) {
    if (performance < 50) return { label: "Низкая", color: "#b42318" };
    if (performance < 80) return { label: "Средняя", color: "#9a6700" };
    return { label: "Высокая", color: "#067647" };
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
}: {
    node: OrgNodeDto;
    layout: LayoutNode;
    renderedPosition: LayoutNode;
    isExpanded: boolean;
    hasChildren: boolean;
    isPanning: boolean;
    isSelected: boolean;
    onToggle: () => void;
    onSelect: (_nodeId: string) => void;
    onClick: () => void;
}) {
    const performanceBand = getPerformanceBand(node.performance);
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect(node.id);
    };
    return (
        <NodeCard
            key={node.id}
            data-node-id={node.id}
            $isPanning={isPanning}
            $isSelected={isSelected}
            $x={renderedPosition.x}
            $y={renderedPosition.y}
            aria-level={layout.depth + 1}
            aria-selected={isSelected}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="treeitem"
            tabIndex={0}
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
                    <MetricValue>{node.headcount}</MetricValue>
                </Metric>
                <Metric>
                    <dt>Бюджет</dt>
                    <MetricValue>{formatBudget(node.budget)} ₽</MetricValue>
                </Metric>
                <Metric>
                    <dt>Эффективность</dt>
                    <PerformanceValue
                        $color={performanceBand.color}
                        aria-label={`Эффективность: ${performanceBand.label}, ${node.performance}`}
                    >
                        {performanceBand.label}: {formatMetricNumber(node.performance)}
                    </PerformanceValue>
                </Metric>
            </Metrics>
            <PerformanceScale
                $color={performanceBand.color}
                $value={node.performance}
                aria-hidden="true"
            />
        </NodeCard>
    );
}
