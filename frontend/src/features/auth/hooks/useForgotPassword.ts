import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../api/authApi';

/**
 * Custom hook for forgot password functionality
 * Sends password reset email to user
 * NOTE: Does NOT update AuthContext (no login happens)
 */
export const useForgotPassword = () => {
  return useMutation({
    // mutationFn: The async function that performs the API call
    // Gets called when you execute: mutate({ email })
    mutationFn: (data: { email: string }) => forgotPassword(data.email),

    // No onSuccess callback needed - forgot password doesn't log user in
    // Just sends email and returns success message
  });
};
