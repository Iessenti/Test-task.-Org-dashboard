import { OrganizationDashboard } from '@/containers/OrganizationDashboard/OrganizationDashboard';
import { AppShell, GlobalStyle } from './App.style';

export function App() {
  return (
    <>
      <GlobalStyle />
      <AppShell>
        <OrganizationDashboard />
      </AppShell>
    </>
  );
}
