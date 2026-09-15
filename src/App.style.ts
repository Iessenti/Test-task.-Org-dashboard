import { createGlobalStyle, styled } from "styled-components";

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
    overflow: hidden;
  }
`;

export const AppShell = styled.main`
    height: 100vh;
    padding: 16px;
    overflow: hidden;
`;
