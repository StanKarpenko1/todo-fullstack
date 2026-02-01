import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { useResetPassword } from '../hooks/useResetPassword';

// Mock the useResetPassword hook
vi.mock('../hooks/useResetPassword');

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams],
  };
});

describe('ResetPasswordForm', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.set('token', 'test-reset-token');

    // Default mock - successful state
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      isPaused: false,
      status: 'idle',
      variables: undefined,
      submittedAt: 0,
      context: undefined,
    } as any);
  });

  it('should render new password and confirm password fields', () => {
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('should render reset password button', () => {
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('should render back to login link', () => {
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it('should call resetPassword mutation on form submit with valid data', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Fill form
    await user.type(screen.getByLabelText(/new password/i), 'newpassword123');
    await user.type(screen.getByLabelText(/confirm password/i), 'newpassword123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    // Assert mutation called with token and password
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        token: 'test-reset-token',
        password: 'newpassword123',
      });
    });
  });

  it('should show validation error for empty new password', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Submit without new password
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for empty confirm password', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Submit without confirm password
    await user.type(screen.getByLabelText(/new password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Type short password
    await user.type(screen.getByLabelText(/new password/i), '123');
    await user.type(screen.getByLabelText(/confirm password/i), '123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Type mismatched passwords
    await user.type(screen.getByLabelText(/new password/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different123');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should disable form and show loading state when submitting', () => {
    // Mock pending state
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      failureCount: 0,
      failureReason: null,
      isIdle: false,
      isPaused: false,
      status: 'pending',
      variables: undefined,
      submittedAt: 0,
      context: undefined,
    } as any);

    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Button should show loading text
    expect(screen.getByRole('button', { name: /resetting/i })).toBeInTheDocument();

    // Button should be disabled
    expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled();
  });

  it('should display error message when request fails', () => {
    const errorMessage = 'Invalid or expired token';

    // Mock error state
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      isSuccess: false,
      error: new Error(errorMessage),
      data: undefined,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      failureCount: 1,
      failureReason: new Error(errorMessage),
      isIdle: false,
      isPaused: false,
      status: 'error',
      variables: undefined,
      submittedAt: 0,
      context: undefined,
    } as any);

    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Should display error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display success message when password reset successfully', () => {
    const successMessage = 'Password reset successful';

    // Mock success state
    vi.mocked(useResetPassword).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
      data: { message: successMessage },
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      failureCount: 0,
      failureReason: null,
      isIdle: false,
      isPaused: false,
      status: 'success',
      variables: undefined,
      submittedAt: 0,
      context: undefined,
    } as any);

    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    // Should display success message
    expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
  });

  it('should render back to login link as anchor tag with correct href', () => {
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    const loginLink = screen.getByRole('link', { name: /back to login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(loginLink.tagName).toBe('A');
  });

  it('should toggle new password visibility when clicking visibility button', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    const newPasswordInput = screen.getByLabelText('New Password');
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });
    const newPasswordToggle = toggleButtons[0]; // First toggle is for new password

    // Initially password should be hidden (type="password")
    expect(newPasswordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(newPasswordToggle);
    expect(newPasswordInput).toHaveAttribute('type', 'text');

    // Click to hide password again
    await user.click(newPasswordToggle);
    expect(newPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should toggle confirm password visibility when clicking visibility button', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ResetPasswordForm />
      </BrowserRouter>
    );

    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });
    const confirmPasswordToggle = toggleButtons[1]; // Second toggle is for confirm password

    // Initially password should be hidden (type="password")
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(confirmPasswordToggle);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Click to hide password again
    await user.click(confirmPasswordToggle);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});
