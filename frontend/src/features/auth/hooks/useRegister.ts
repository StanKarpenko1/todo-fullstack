import { useMutation } from '@tanstack/react-query';
import { registerUser } from '../api/authApi';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { RegisterData } from '../types/auth.types';

/**
 * Custom hook for registration functionality
 * Combines React Query mutation with AuthContext updates (auto-login)
 */
export const useRegister = () => {
  const { login } = useAuth();

  return useMutation({
    // mutationFn: The async function that performs the API call
    // Gets called when you execute: mutate({ email, password, name })
    mutationFn: registerUser,

    // onSuccess: Callback when API call succeeds
    // Automatically logs in the newly registered user
    onSuccess: (data) => {
      // Update AuthContext with token + user data (auto-login after registration)
      login(data.token, data.user);
    },
  });
};
