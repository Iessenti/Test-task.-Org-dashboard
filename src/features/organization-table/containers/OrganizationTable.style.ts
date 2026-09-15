import { styled } from "styled-components";

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
