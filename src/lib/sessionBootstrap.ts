import { loadUser } from "@/store/authSlice";
import type { AppDispatch } from "@/store/store";

let inflightBootstrap: Promise<void> | null = null;

/**
 * Ensures only one session bootstrap request runs at a time.
 * This prevents duplicate `/auth/refresh` calls in StrictMode/dev remounts.
 */
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
