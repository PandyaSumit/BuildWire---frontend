import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

/** App-level auth wrapper; session bootstrap happens in `ProtectedRoute` and `HomePage`. */
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
