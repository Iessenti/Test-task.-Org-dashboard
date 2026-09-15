import { styled } from "styled-components";

export const StatePanel = styled.section`
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
    padding: 12px;
    border: 1px solid #dce3ee;
    border-radius: 16px;
    background: #ffffff;

`;

export const StateContent = styled.div<{ $centered?: boolean }>`
    display: grid;
    flex: ${({ $centered }) => ($centered ? "1 1 auto" : "0 0 auto")};
    gap: 12px;
    min-height: 0;
    width: 100%;
    align-content: ${({ $centered }) => ($centered ? "center" : "normal")};
    justify-items: ${({ $centered }) => ($centered ? "center" : "start")};
    text-align: ${({ $centered }) => ($centered ? "center" : "left")};
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
        to {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
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
    margin: 0;
    color: #526176;
    font-size: 0.9rem;
`;

export const StatusGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 14px;
    min-width: 0;
`;

export const RealtimeStatus = styled.span<{ $status: 'live' | 'reconnecting' | 'offline' }>`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 10px 5px 8px;
    border-radius: 999px;
    color: ${({ $status }) => ({
        live: '#166534',
        reconnecting: '#92400e',
        offline: '#991b1b',
    }[$status])};
    background: ${({ $status }) => ({
        live: '#dcfce7',
        reconnecting: '#fef3c7',
        offline: '#fee2e2',
    }[$status])};
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;

    &::before {
        width: 8px;
        height: 8px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: ${({ $status }) => ({
            live: '#16a34a',
            reconnecting: '#f59e0b',
            offline: '#dc2626',
        }[$status])};
        box-shadow: 0 0 0 3px ${({ $status }) => ({
            live: 'rgb(22 163 74 / 14%)',
            reconnecting: 'rgb(245 158 11 / 18%)',
            offline: 'rgb(220 38 38 / 14%)',
        }[$status])};
        content: '';
    }
`;

export const RealtimeNotificationRegion = styled.div`
    position: fixed;
    right: auto;
    bottom: 20px;
    left: 20px;
    z-index: 20;
    display: grid;
    gap: 8px;
    width: min(360px, calc(100vw - 40px));
    pointer-events: none;
`;

export const RealtimeNotification = styled.div`
    padding: 12px 14px;
    border: 1px solid #c8d7e9;
    border-radius: 10px;
    color: #18212f;
    background: #ffffff;
    box-shadow: 0 8px 24px rgb(44 62 80 / 16%);
    font-size: 0.9rem;
`;

export const ViewHeader = styled.header`
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

export const ModeSwitch = styled.div`
    display: inline-flex;
    padding: 3px;
    border: 1px solid #dce3ee;
    border-radius: 10px;
    background: #f4f7fb;
`;

export const ModeButton = styled.button<{ $active: boolean }>`
    padding: 7px 12px;
    border: 0;
    border-radius: 7px;
    color: ${({ $active }) => ($active ? "#18212f" : "#526176")};
    background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
    box-shadow: ${({ $active }) => ($active ? "0 1px 3px rgb(24 33 47 / 12%)" : "none")};
    font: inherit;
    cursor: pointer;
`;
