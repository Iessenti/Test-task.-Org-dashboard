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

export const TableShell = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;

    th,
    td {
        padding: 12px 14px;
        border-bottom: 1px solid #edf1f7;
        text-align: left;
        white-space: nowrap;
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
