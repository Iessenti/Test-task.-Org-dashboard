import { styled } from 'styled-components';
import { CARD_HEIGHT, CARD_WIDTH } from '@/features/organization-tree/model/canvas-layout';

export const CanvasViewport = styled.div<{ $isPanning: boolean }>`
  position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden;
  touch-action: none; user-select: none; border: 1px solid #dce3ee;
  border-radius: 16px; background-color: #f8fbff;
  background-image: radial-gradient(#dce3ee 1px, transparent 1px);
  background-size: 18px 18px;
  cursor: ${({ $isPanning }) => ($isPanning ? 'grabbing' : 'grab')};
`;

export const CanvasSurface = styled.div<{
  $height: number; $offsetX: number; $offsetY: number; $scale: number; $width: number;
}>`
  position: relative; width: ${({ $width }) => $width}px; min-width: 100%;
  height: ${({ $height }) => $height}px;
  transform: translate(${({ $offsetX }) => $offsetX}px, ${({ $offsetY }) => $offsetY}px)
    scale(${({ $scale }) => $scale}); transform-origin: 0 0;
`;

export const CanvasFrame = styled.div`
  position: relative; display: flex; flex: 1 1 auto; flex-direction: column; min-height: 0;
`;

export const CanvasControls = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;
`;

export const CanvasControl = styled.button`
  min-width: 40px; min-height: 36px; padding: 0 12px; border: 1px solid #c8d7e9;
  border-radius: 8px; color: #245a98; background: #ffffff; font: inherit;
  font-weight: 600; cursor: pointer;
  &:focus-visible, &:hover { border-color: #73abf5; }
`;

export const EdgeLayer = styled.svg`
  position: absolute; inset: 0; overflow: visible; pointer-events: none; z-index: 0;
`;

export const ArrowLayer = styled.svg`
  position: absolute; inset: 0; overflow: visible; pointer-events: none; z-index: 2;
`;

export const NodeCard = styled.article<{
  $isPanning: boolean; $isSelected: boolean; $x: number; $y: number;
}>`
  position: absolute; top: ${({ $y }) => $y}px; left: ${({ $x }) => $x}px;
  display: grid; gap: 12px; width: ${CARD_WIDTH}px; min-height: ${CARD_HEIGHT}px;
  padding: 16px; border: 1px solid #dce3ee; border-radius: 14px; background: #ffffff;
  box-shadow: ${({ $isSelected }) => $isSelected
    ? '0 0 0 6px rgb(115 171 245 / 18%), 0 10px 28px rgb(44 62 80 / 14%)'
    : '0 8px 24px rgb(44 62 80 / 8%)'};
  outline: 3px solid transparent;
  outline-color: ${({ $isSelected }) => ($isSelected ? '#73abf5' : 'transparent')};
  outline-offset: 2px; cursor: ${({ $isPanning }) => ($isPanning ? 'grabbing' : 'pointer')};
  transition: box-shadow 180ms ease, outline-color 180ms ease;
  @media (prefers-reduced-motion: reduce) { transition: none; }
  &:focus-visible { outline-color: #73abf5; box-shadow: 0 0 0 6px rgb(115 171 245 / 18%), 0 10px 28px rgb(44 62 80 / 14%); }
`;

export const NodeHeader = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
`;
export const NodeName = styled.span`
  color: #18212f; font-weight: 700; line-height: 1.25;
`;
export const NodeToggle = styled.button`
  display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto;
  width: 28px; height: 28px; padding: 0; border: 1px solid #73abf5; border-radius: 8px;
  color: #245a98; background: #ffffff; font: inherit; font-weight: 700; line-height: 1;
  text-align: center; cursor: pointer;
`;
export const Metrics = styled.dl`
  display: grid; gap: 6px; margin: 0;
`;
export const Metric = styled.div`
  display: flex; justify-content: space-between; gap: 8px; color: #526176; font-size: 0.84rem;
`;
export const MetricValue = styled.dd`
  margin: 0; color: #18212f; font-weight: 600; text-align: right;
`;
export const PerformanceValue = styled(MetricValue)<{ $color: string }>`
  color: ${({ $color }) => $color};
`;
export const PerformanceScale = styled.span<{ $color: string; $value: number }>`
  display: block; width: 100%; height: 5px; overflow: hidden; border-radius: 999px; background: #e8edf4;
  &::before { display: block; width: ${({ $value }) => `${$value}%`}; height: 100%; border-radius: inherit; background: ${({ $color }) => $color}; content: ''; }
`;
