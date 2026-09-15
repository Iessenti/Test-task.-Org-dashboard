import { styled } from 'styled-components';

export const SearchInput = styled.input`
  display: block;
  width: min(420px, 100%);
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
