import { OrganizationDashboard } from '@/containers/OrganizationDashboard/OrganizationDashboard';
import { AppShell, GlobalStyle, Title } from './App.style';

export function App() {
  return (
    <>
      <GlobalStyle />
      <AppShell aria-labelledby="app-title">
        <Title id="app-title">Staff Pulse</Title>
        <OrganizationDashboard />
      </AppShell>
    </>
  );
}
