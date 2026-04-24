import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { setAccessToken, clearAccessToken } from '@/lib/tokenStore';
import type { OrgRole } from '@/types/rbac';

/**
 * Current org context from `/auth/me` and login (`formatUser` on server).
 * `role` is `organization_members.role` for the user’s active membership.
 */
export interface AuthOrg {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  country?: string;
  timezone?: string;
  orgType?: string;
  role: OrgRole;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  emailVerified: boolean;
  onboardingStep: number;
  onboardingComplete: boolean;
  org?: AuthOrg;
}

const extractError = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { error?: string; message?: string } } };
  return e?.response?.data?.error || e?.response?.data?.message || fallback;
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  emailError: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  emailError: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    args: { email: string; password: string; rememberMe?: boolean },
    { rejectWithValue }
  ) => {
    const { email, password, rememberMe = false } = args;
    try {
      const { data } = await api.post('/auth/login', { email, password, rememberMe });
      setAccessToken(data.data.accessToken);
      return { user: data.data.user as AuthUser };
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, 'Login failed'));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      orgName: string;
      phone?: string;
      country?: string;
      orgType?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      setAccessToken(data.data.accessToken);
      return { user: data.data.user as AuthUser };
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, 'Registration failed'));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout', {});
  } catch {
    // ignore
  }
  clearAccessToken();
});

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      try {
        const { data: refreshData } = await api.post('/auth/refresh', {});
        setAccessToken(refreshData.data.accessToken);
      } catch {
        clearAccessToken();
        return rejectWithValue('refresh');
      }
      const { data } = await api.get('/auth/me');
      return { user: data.data.user as AuthUser };
    } catch {
      clearAccessToken();
      return rejectWithValue('me');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<AuthUser>, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/profile', updates);
      return { user: data.data.user as AuthUser };
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, 'Update failed'));
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      await api.get(`/auth/verify-email?token=${token}`);
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, 'Verification failed'));
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email: string, { rejectWithValue }) => {
    try {
      await api.post('/auth/resend-verification', { email });
    } catch (err: unknown) {
      return rejectWithValue(extractError(err, 'Failed to resend email'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.emailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Registration failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.emailError = null;
      })
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'Update failed';
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        if (state.user) {
          state.user = { ...state.user, emailVerified: true };
        }
      })
      .addCase(verifyEmail.rejected, () => {
        // error surfaced by caller via thunk result
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
