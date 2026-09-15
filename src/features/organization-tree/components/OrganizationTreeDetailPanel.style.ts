import { styled } from 'styled-components';

export const DetailPanel = styled.aside`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 5;
  width: min(320px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  overflow: auto;
  padding: 16px;
  border: 1px solid #dce3ee;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 14px 36px rgb(44 62 80 / 18%);
  transform: translateX(0);
  transition: transform 220ms ease;
  animation: detail-panel-enter 220ms ease both;
  @keyframes detail-panel-enter {
    from { opacity: 0; transform: translateX(calc(100% + 16px)); }
    to { opacity: 1; transform: translateX(0); }
  }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const DetailTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 16px;
  font-size: 1rem;
`;

export const DetailCloseButton = styled.button`
  display: inline-grid;
  width: 32px;
  height: 32px;
  place-items: center;
  flex: 0 0 auto;
  padding: 0 0 2px;
  border: 1px solid #dce3ee;
  border-radius: 50%;
  color: #526176;
  background: #f4f7fb;
  font: inherit;
  font-size: 1.35rem;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease, transform 160ms ease;
  &:hover { border-color: #73abf5; color: #18212f; background: #eaf3ff; transform: rotate(90deg); }
  &:focus-visible { border-color: #73abf5; color: #18212f; background: #eaf3ff; outline: 3px solid rgb(115 171 245 / 28%); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { transition: none; }
`;

export const DetailSection = styled.section`
  & + & { margin-top: 16px; }
`;

export const DetailSectionTitle = styled.h3`
  margin: 0 0 8px;
  color: #526176;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const DetailMetrics = styled.dl`
  display: grid;
  gap: 6px;
  margin: 0;
`;

export const DetailMetric = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.88rem;
`;

export const DetailMetricValue = styled.dd`
  margin: 0;
  font-weight: 400;
  text-align: right;
`;

export const DetailChildren = styled.ul`
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 20px;
`;

export const DetailMuted = styled.p`
  margin: 0;
  color: #526176;
  font-size: 0.88rem;
`;
