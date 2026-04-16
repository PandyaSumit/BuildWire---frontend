import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import './styles/workspace-themes.css';
import App from './App';
import { ThemeProvider } from '@/components/theme';
import { AppI18n } from '@/i18n/AppI18n';
import { StoreProvider } from '@/components/providers';
import { AuthProvider } from '@/components/auth/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppI18n>
        <ThemeProvider>
          <StoreProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </AppI18n>
    </BrowserRouter>
  </StrictMode>
);
