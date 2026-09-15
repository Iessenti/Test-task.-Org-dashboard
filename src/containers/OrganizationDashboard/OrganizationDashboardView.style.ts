import { styled } from 'styled-components';

export const StatePanel = styled.section`
  display: flex;
  flex-direction: column;
  height: min(800px, calc(100vh - 120px));
  padding: 24px;
  border: 1px solid #dce3ee;
  border-radius: 16px;
  background: #ffffff;

  @media (max-width: 640px) {
    height: min(900px, calc(100vh - 88px));
    padding: 16px;
  }
`;

export const StateContent = styled.div<{ $centered?: boolean }>`
  display: grid;
  flex: ${({ $centered }) => ($centered ? '1 1 auto' : '0 0 auto')};
  gap: 12px;
  min-height: 0;
  width: 100%;
  align-content: ${({ $centered }) => ($centered ? 'center' : 'normal')};
  justify-items: ${({ $centered }) => ($centered ? 'center' : 'start')};
  text-align: ${({ $centered }) => ($centered ? 'center' : 'left')};
`;

export const StateMessage = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
`;

export const LoadingSpinner = styled.span`
  width: 20px;
  height: 20px;
  border: 3px solid #dce3ee;
  border-top-color: #73abf5;
  border-radius: 50%;
  animation: organization-spinner 800ms linear infinite;

  @keyframes organization-spinner {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const RetryButton = styled.button`
  padding: 8px 14px;
  border: 1px solid #73abf5;
  border-radius: 8px;
  color: #18212f;
  background: #ffffff;
  font: inherit;
  cursor: pointer;
`;

export const BackgroundStatus = styled.p`
  margin: 0 0 16px;
  color: #526176;
  font-size: 0.9rem;
`;
