import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import App from './App';
import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <StoreProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </StoreProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
