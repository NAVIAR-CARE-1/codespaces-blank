import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { loginUser, registerUser, logout, clearError } from '@/store/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const login = (email: string, password: string) => {
    return dispatch(loginUser({ email, password }));
  };

  const register = (email: string, password: string, name: string, type: string) => {
    return dispatch(registerUser({ email, password, name, type }));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
    clearError: clearAuthError
  };
}
