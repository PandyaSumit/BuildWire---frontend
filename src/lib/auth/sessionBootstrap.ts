import { loadUser } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store/store';

let inflightBootstrap: Promise<void> | null = null;

export function bootstrapSession(dispatch: AppDispatch): Promise<void> {
  if (!inflightBootstrap) {
    inflightBootstrap = dispatch(loadUser())
      .unwrap()
      .then(() => undefined)
      .finally(() => {
        inflightBootstrap = null;
      });
  }
  return inflightBootstrap;
}
