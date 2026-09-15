import { BranchToggleIcon } from "./BranchToggleIcon";
import {
    CanvasControl,
    CanvasControls,
} from "@/features/organization-tree/containers/OrganizationTree.style";

export function OrganizationTreeControls({
    onZoomIn,
    onZoomOut,
    onFit,
}: {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFit: () => void;
}) {
    return (
        <CanvasControls aria-label="Управление canvas" role="group">
            <CanvasControl
                aria-label="Увеличить масштаб"
                onClick={onZoomIn}
                type="button"
            >
                <BranchToggleIcon isExpanded={false} />
            </CanvasControl>
            <CanvasControl
                aria-label="Уменьшить масштаб"
                onClick={onZoomOut}
                type="button"
            >
                <BranchToggleIcon isExpanded />
            </CanvasControl>
            <CanvasControl aria-label="Fit view" onClick={onFit} type="button">
                Вписать
            </CanvasControl>
        </CanvasControls>
    );
}
