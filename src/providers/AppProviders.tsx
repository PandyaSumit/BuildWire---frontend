import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme';
import { AppI18n } from '@/i18n/AppI18n';
import { StoreProvider } from './StoreProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';

/** Composes all global app providers in the correct dependency order. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AppI18n>
        <ThemeProvider>
          <StoreProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </AppI18n>
    </BrowserRouter>
  );
}
