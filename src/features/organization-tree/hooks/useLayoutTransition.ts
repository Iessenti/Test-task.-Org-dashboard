import { useEffect, useRef, useState } from 'react';
import { CARD_HEIGHT, interpolatePositions, type LayoutNode } from '@/features/organization-tree/model/canvas-layout';

function getTransitionTargets(
  positions: Record<string, LayoutNode>,
  from: Readonly<Record<string, LayoutNode>>,
) {
  const targets = { ...positions };
  for (const previous of Object.values(from)) {
    if (targets[previous.id] !== undefined) continue;
    const parent = previous.parentId === null
      ? undefined
      : targets[previous.parentId] ?? from[previous.parentId];
    if (parent === undefined) continue;
    targets[previous.id] = {
      ...previous,
      x: parent.x,
      y: parent.y + CARD_HEIGHT,
    };
  }
  return targets;
}

export function useLayoutTransition(positions: Record<string, LayoutNode>) {
  const [renderedPositions, setRenderedPositions] = useState(() => positions);
  const renderedPositionsRef = useRef(renderedPositions);
  const retainPositions = (nextPositions: Record<string, LayoutNode>) => ({
    ...renderedPositionsRef.current,
    ...nextPositions,
  });
  useEffect(() => {
    const from = renderedPositionsRef.current;
    const transitionTargets = getTransitionTargets(positions, from);
    const hasPositionChanges = Object.values(transitionTargets).some((target) => {
      const previous = from[target.id];
      return previous === undefined || previous.x !== target.x || previous.y !== target.y;
    });

    if (!hasPositionChanges) {
      renderedPositionsRef.current = retainPositions(positions);
      setRenderedPositions(renderedPositionsRef.current);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frameId = requestAnimationFrame(() => {
        renderedPositionsRef.current = retainPositions(positions);
        setRenderedPositions(renderedPositionsRef.current);
      });
      return () => cancelAnimationFrame(frameId);
    }

    const startedAt = performance.now();
    let frameId = 0;
    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / 280, 1);
      const nextPositions = {
        ...from,
        ...interpolatePositions(from, transitionTargets, 1 - (1 - progress) ** 3),
      };
      renderedPositionsRef.current = nextPositions;
      setRenderedPositions(nextPositions);
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else {
        renderedPositionsRef.current = retainPositions(positions);
        setRenderedPositions(renderedPositionsRef.current);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [positions]);

  return renderedPositions;
}
