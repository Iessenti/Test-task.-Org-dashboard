import { styled } from "styled-components";

export const FeedbackValue = styled.span<{ $active: boolean; $color: string }>`
    display: inline-block;
    color: ${({ $color }) => $color};
    ${({ $active }) => $active ? 'animation: table-realtime-feedback-fade 1.5s ease-out both;' : ''}

    @keyframes table-realtime-feedback-fade {
        0%, 28% {
            opacity: 0.42;
            color: #854d0e;
            background-color: #fde68a;
            box-shadow: inset 0 0 0 1px #f59e0b, 0 0 0 2px rgb(245 158 11 / 0.14);
        }
        100% {
            opacity: 1;
            color: ${({ $color }) => $color};
            background-color: transparent;
            box-shadow: inset 0 0 0 1px transparent, 0 0 0 2px transparent;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        opacity: 1;
        color: ${({ $active, $color }) => ($active ? '#854d0e' : $color)};
        background-color: ${({ $active }) => ($active ? '#fde68a' : 'transparent')};
        box-shadow: none;
    }
`;

export const TableSurface = styled.div`
    display: grid;
    flex: 1 1 auto;
    min-height: 0;
    align-content: start;
    overflow: auto;
    border: 1px solid #dce3ee;
    border-radius: 12px;
`;

export const TableState = styled.div`
    display: grid;
    flex: 1 1 auto;
    min-height: 180px;
    place-content: center;
    justify-items: center;
    gap: 12px;
    padding: 24px;
    color: #526176;
    text-align: center;
`;

export const TableStateMessage = styled.span`
    color: #18212f;
    font-size: 1rem;
    font-weight: 600;
`;

export const TableStateButton = styled.button`
    padding: 8px 14px;
    border: 1px solid #73abf5;
    border-radius: 8px;
    color: #18212f;
    background: #ffffff;
    font: inherit;
    cursor: pointer;

    &:hover { background: #f4f8ff; }
    &:focus-visible { outline: 3px solid rgb(115 171 245 / 28%); outline-offset: 2px; }
`;

export const TableStateSpinner = styled.span`
    width: 22px;
    height: 22px;
    border: 3px solid #dce3ee;
    border-top-color: #73abf5;
    border-radius: 50%;
    animation: table-state-spinner 800ms linear infinite;

    @keyframes table-state-spinner {
        to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
`;

export const TableEmptyCell = styled.td`
    padding: 48px 20px !important;
    color: #526176;
    text-align: center !important;
    white-space: normal !important;
`;

export const TableShell = styled.table`
    width: 100%;
    min-width: 760px;
    table-layout: fixed;
    border-collapse: collapse;
    background: #ffffff;

    col:nth-child(1) { width: 28%; }
    col:nth-child(2) { width: 14%; }
    col:nth-child(3) { width: 18%; }
    col:nth-child(4) { width: 20%; }
    col:nth-child(5) { width: 20%; }

    th,
    td {
        padding: 12px 14px;
        border-bottom: 1px solid #edf1f7;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    thead {
        position: sticky;
        top: 0;
        z-index: 3;
        background: #f8faff;
    }

    thead tr:last-child th {
        box-shadow: 0 1px 0 #dce3ee;
    }

    thead button {
        padding: 0;
        border: 0;
        color: inherit;
        background: transparent;
        font: inherit;
        font-weight: 700;
        text-align: left;
        cursor: pointer;
    }

    thead th:first-child button {
        font-family: Georgia, serif;
    }
    thead th:nth-child(2) button {
        font-family: "Trebuchet MS", sans-serif;
    }
    thead th:nth-child(n + 3) button {
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.01em;
    }
    tbody td:first-child {
        font-family: Georgia, serif;
        font-weight: 400;
    }
    tbody td:nth-child(2) {
        color: #526176;
        font-family: "Trebuchet MS", sans-serif;
        font-size: 0.9rem;
    }
    tbody td:nth-child(n + 3) {
        font-variant-numeric: tabular-nums;
    }

    tbody tr[aria-selected="true"] {
        background: #eef5ff;
    }

    tbody tr {
        cursor: pointer;
    }
`;
