import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { loginUser, registerUser, logout, restoreAuth, clearError } from '@/store/authSlice';
import { LoginPayload, RegisterPayload } from '@/types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    return dispatch(loginUser({ email, password }));
  };

  const register = async (email: string, password: string, name: string, type: string) => {
    return dispatch(
      registerUser({
        email,
        password,
        name,
        type: type as 'admin' | 'consultant' | 'employee' | 'manager',
      })
    );
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const restoreSession = () => {
    dispatch(restoreAuth());
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
    clearError: handleClearError,
    restoreSession,
  };
};
