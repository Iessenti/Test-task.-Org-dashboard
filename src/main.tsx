import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import { OrgTreeQueryProvider } from '@/data/org-tree/org-tree-query';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OrgTreeQueryProvider>
      <App />
    </OrgTreeQueryProvider>
  </StrictMode>,
);
