import type { ReactElement } from "react";
import {
    ARROW_LENGTH,
    ARROW_OVERLAP,
    CARD_HEIGHT,
    CARD_WIDTH,
    type LayoutNode,
} from "@/features/organization-tree/model/canvas-layout";
import {
    ArrowLayer,
    EdgeLayer,
    EdgePath,
} from "@/features/organization-tree/containers/OrganizationTree.style";

function edgePath(parent: LayoutNode, child: LayoutNode) {
    const startX = parent.x + CARD_WIDTH / 2;
    const startY = parent.y + CARD_HEIGHT;
    const endX = child.x + CARD_WIDTH / 2;
    const endY = child.y - ARROW_OVERLAP;
    const curve = Math.max((endY - startY) * 0.45, 24);
    return `M ${startX} ${startY} C ${startX} ${startY + curve}, ${endX} ${endY - curve}, ${endX} ${endY}`;
}

export function OrganizationTreeEdges({
    edges,
    width,
    height,
}: {
    edges: Array<{ parent: LayoutNode; child: LayoutNode; isVisible: boolean }>;
    width: number;
    height: number;
}) {
    return (
        <>
            <EdgeLayer aria-hidden="true" height={height} width={width}>
                {edges.map(({ parent, child, isVisible }) => (
                    <EdgePath
                        key={`${parent.id}-${child.id}`}
                        d={edgePath(parent, child)}
                        $isVisible={isVisible}
                        fill="none"
                        stroke="#b8c7da"
                        strokeWidth="2"
                    />
                ))}
            </EdgeLayer>
            <ArrowLayer aria-hidden="true" height={height} width={width}>
                <defs>
                    <marker
                        id="organization-arrow"
                        markerHeight={ARROW_LENGTH}
                        markerUnits="userSpaceOnUse"
                        markerWidth={ARROW_LENGTH}
                        orient="auto"
                        refX="0"
                        refY={ARROW_LENGTH / 2}
                        viewBox={`0 0 ${ARROW_LENGTH} ${ARROW_LENGTH}`}
                    >
                        <path
                            d={`M 0 0 L ${ARROW_LENGTH} ${ARROW_LENGTH / 2} L 0 ${ARROW_LENGTH} z`}
                            fill="#b8c7da"
                        />
                    </marker>
                </defs>
                {edges.map(({ parent, child, isVisible }): ReactElement => (
                    <EdgePath
                        key={`${parent.id}-${child.id}`}
                        d={edgePath(parent, child)}
                        $isVisible={isVisible}
                        fill="none"
                        markerEnd="url(#organization-arrow)"
                        stroke="transparent"
                        strokeWidth="1"
                    />
                ))}
            </ArrowLayer>
        </>
    );
}
