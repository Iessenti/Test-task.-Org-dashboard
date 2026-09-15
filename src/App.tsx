import { createGlobalStyle, styled } from 'styled-components';

const GlobalStyle = createGlobalStyle`
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

const AppShell = styled.main`
  min-height: 100vh;
  padding: 32px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  line-height: 1.2;
`;

export function App() {
  return (
    <>
      <GlobalStyle />
      <AppShell aria-labelledby="app-title">
        <Title id="app-title">Staff Pulse</Title>
      </AppShell>
    </>
  );
}
