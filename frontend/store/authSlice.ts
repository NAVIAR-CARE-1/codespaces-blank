import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginPayload, RegisterPayload, ApiResponse } from '@/types';
import { apiClient } from '@/lib/axios';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.payload) {
        localStorage.setItem('authToken', response.payload.token);
        localStorage.setItem('user', JSON.stringify(response.payload.user));
        return response.payload;
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/api/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
        type: data.type,
      });

      if (response.payload) {
        localStorage.setItem('authToken', response.payload.token);
        localStorage.setItem('user', JSON.stringify(response.payload.user));
        return response.payload;
      }
      return rejectWithValue(response.message || 'Registration failed');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(errorMsg);
    }
  }
);

export const restoreAuth = createAsyncThunk(
  'auth/restoreAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        return { user, token };
      }
      return rejectWithValue('No stored auth');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to restore auth';
      return rejectWithValue(errorMsg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(restoreAuth.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
