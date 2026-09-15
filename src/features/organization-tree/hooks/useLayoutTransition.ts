import { useEffect, useRef, useState } from 'react';
import { interpolatePositions, type LayoutNode } from '@/features/organization-tree/model/canvas-layout';

export function useLayoutTransition(positions: Record<string, LayoutNode>) {
  const [renderedPositions, setRenderedPositions] = useState(() => positions);
  const renderedPositionsRef = useRef(renderedPositions);

  useEffect(() => {
    const from = renderedPositionsRef.current;
    const hasPositionChanges = Object.values(positions).some((target) => {
      const previous = from[target.id];
      return previous === undefined || previous.x !== target.x || previous.y !== target.y;
    });

    if (!hasPositionChanges) {
      renderedPositionsRef.current = positions;
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frameId = requestAnimationFrame(() => {
        renderedPositionsRef.current = positions;
        setRenderedPositions(positions);
      });
      return () => cancelAnimationFrame(frameId);
    }

    const startedAt = performance.now();
    let frameId = 0;
    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / 280, 1);
      const nextPositions = interpolatePositions(from, positions, 1 - (1 - progress) ** 3);
      renderedPositionsRef.current = nextPositions;
      setRenderedPositions(nextPositions);
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else {
        renderedPositionsRef.current = positions;
        setRenderedPositions(positions);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [positions]);

  return renderedPositions;
}
