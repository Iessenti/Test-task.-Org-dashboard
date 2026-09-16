import { styled } from 'styled-components';

export const SearchToolbar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 720px;
`;

export const SearchInput = styled.input`
  flex: 1 1 320px;
  min-width: min(320px, 100%);
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #b9c8dc;
  border-radius: 10px;
  color: #18212f;
  background: #ffffff;
  font: inherit;
  font-size: 1rem;
  font-weight: 400;
  outline: none;
  box-shadow: 0 2px 8px rgb(44 62 80 / 6%);

  &::placeholder { color: #7b8aa0; }
  &:focus { border-color: #73abf5; box-shadow: 0 0 0 3px rgb(115 171 245 / 22%); }
`;

export const AiSearchButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 44px;
  padding: 0 14px !important;
  border: 1px solid #b7cae4 !important;
  border-radius: 9px;
  color: #245a98 !important;
  background: #f5f9ff;
  box-shadow: none;
  cursor: pointer !important;
  transition: border-color 140ms ease, background-color 140ms ease, opacity 140ms ease;

  &:hover:not(:disabled) {
    border-color: #73abf5 !important;
    background: #eaf3ff;
  }

  &:focus-visible {
    outline: 3px solid rgb(115 171 245 / 38%);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.58;
    cursor: wait !important;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const AiSearchGlyph = styled.span`
  font-size: 1.1rem;
  line-height: 1;
`;

export const AiSearchStatus = styled.span<{ $error?: boolean }>`
  flex-basis: 100%;
  margin: 0 2px;
  color: ${({ $error }) => ($error ? '#a33a3a' : '#60718a')};
  font-size: 0.82rem;
  line-height: 1.35;
`;

export const AiSearchSpinner = styled.span`
  width: 13px;
  height: 13px;
  border: 2px solid rgb(255 255 255 / 45%);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ai-search-spin 700ms linear infinite;

  @keyframes ai-search-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
