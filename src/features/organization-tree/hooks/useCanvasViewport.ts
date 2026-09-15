import { useRef, useState, type MutableRefObject, type PointerEvent, type RefObject, type WheelEvent } from 'react';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  type CanvasLayout,
} from '@/features/organization-tree/model/canvas-layout';

export type ViewportState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function useCanvasViewport(
  layout: CanvasLayout,
  canvasViewportRef: RefObject<HTMLDivElement | null>,
  panMovedRef: MutableRefObject<boolean>,
) {
  const [viewport, setViewport] = useState<ViewportState>({ offsetX: 0, offsetY: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    offsetX: number;
    offsetY: number;
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);

  const clampZoom = (scale: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));

  const zoomTo = (requestedScale: number, anchorX: number, anchorY: number) => {
    setViewport((currentViewport) => {
      const scale = clampZoom(requestedScale);
      const worldX = (anchorX - currentViewport.offsetX) / currentViewport.scale;
      const worldY = (anchorY - currentViewport.offsetY) / currentViewport.scale;
      return {
        offsetX: anchorX - worldX * scale,
        offsetY: anchorY - worldY * scale,
        scale,
      };
    });
  };

  const zoomAroundCenter = (direction: 1 | -1) => {
    const element = canvasViewportRef.current;
    if (element === null) return;
    zoomTo(viewport.scale + direction * ZOOM_STEP, element.clientWidth / 2, element.clientHeight / 2);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const element = canvasViewportRef.current;
    if (element === null) return;
    const bounds = element.getBoundingClientRect();
    zoomTo(
      viewport.scale + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP),
      event.clientX - bounds.left,
      event.clientY - bounds.top,
    );
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target;
    if (
      event.button !== 0 ||
      (target instanceof HTMLElement && target.closest('button, a, input, select, textarea') !== null)
    ) return;

    panMovedRef.current = false;
    panStartRef.current = {
      offsetX: viewport.offsetX,
      offsetY: viewport.offsetY,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    setIsPanning(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const panStart = panStartRef.current;
    if (panStart?.pointerId !== event.pointerId) return;

    const hasMoved =
      Math.abs(event.clientX - panStart.startX) > 4 || Math.abs(event.clientY - panStart.startY) > 4;
    if (hasMoved) {
      panMovedRef.current = true;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }

    setViewport((currentViewport) => ({
      ...currentViewport,
      offsetX: panStart.offsetX + event.clientX - panStart.startX,
      offsetY: panStart.offsetY + event.clientY - panStart.startY,
    }));
  };

  const stopPanning = (event: PointerEvent<HTMLDivElement>) => {
    if (panStartRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    panStartRef.current = null;
    setIsPanning(false);
  };

  const resetView = () => setViewport({ offsetX: 0, offsetY: 0, scale: 1 });

  const consumePan = () => {
    const moved = panMovedRef.current;
    panMovedRef.current = false;
    return moved;
  };

  const fitView = () => {
    const element = canvasViewportRef.current;
    if (element === null) return;
    const scale = clampZoom(Math.min(element.clientWidth / layout.width, element.clientHeight / layout.height));
    setViewport({
      offsetX: (element.clientWidth - layout.width * scale) / 2,
      offsetY: (element.clientHeight - layout.height * scale) / 2,
      scale,
    });
  };

  return {
    viewport,
    isPanning,
    consumePan,
    zoomAroundCenter,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    stopPanning,
    resetView,
    fitView,
  };
}
