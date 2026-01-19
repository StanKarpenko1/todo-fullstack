import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../api/authApi';

/**
 * Custom hook for reset password functionality
 * Resets user password using reset token from email
 * NOTE: Does NOT update AuthContext (user must login manually after reset)
 */
export const useResetPassword = () => {
  return useMutation({
    // mutationFn: The async function that performs the API call
    // Gets called when you execute: mutate({ token, password })
    mutationFn: (data: { token: string; password: string }) =>
      resetPassword(data.token, data.password),

    // No onSuccess callback - user must manually login after password reset
    // This is a security best practice (don't auto-login after password change)
  });
};
