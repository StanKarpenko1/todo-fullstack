import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../api/authApi';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { LoginCredentials } from '../types/auth.types';

/**
 * Custom hook for login functionality
 * Combines React Query mutation with AuthContext updates
 */
export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    // mutationFn: The async function that performs the API call
    // Gets called when you execute: mutate({ email, password })
    mutationFn: loginUser,

    // onSuccess: Callback when API call succeeds
    // Receives the API response data
    onSuccess: (data) => {
      // Update AuthContext with token + user data
      login(data.token, data.user);
    },
  });
};
