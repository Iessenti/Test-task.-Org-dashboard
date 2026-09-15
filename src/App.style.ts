import { createGlobalStyle, styled } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    color: #18212f;
    background: #f4f7fb;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
  }
`;

export const AppShell = styled.main`
  min-height: 100vh;
  padding: 32px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  line-height: 1.2;
`;
