import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { useForgotPassword } from '../hooks/useForgotPassword';

// Mock the useForgotPassword hook
vi.mock('../hooks/useForgotPassword');

describe('ForgotPasswordForm', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock - successful state
    vi.mocked(useForgotPassword).mockReturnValue({
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

  it('should render email field', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should render send reset link button', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('should render back to login link', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it('should call forgotPassword mutation on form submit with valid email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    // Assert mutation called with email
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });

  it('should show validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    // Submit without email
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    // Type invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should disable form and show loading state when submitting', () => {
    // Mock pending state
    vi.mocked(useForgotPassword).mockReturnValue({
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

    render(<ForgotPasswordForm />);

    // Button should show loading text
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();

    // Button should be disabled
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });

  it('should display error message when request fails', () => {
    const errorMessage = 'User not found';

    // Mock error state
    vi.mocked(useForgotPassword).mockReturnValue({
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

    render(<ForgotPasswordForm />);

    // Should display error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display success message when email sent successfully', () => {
    const successMessage = 'Password reset email sent';

    // Mock success state
    vi.mocked(useForgotPassword).mockReturnValue({
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

    render(<ForgotPasswordForm />);

    // Should display success message
    expect(screen.getByText(/check your email for reset link/i)).toBeInTheDocument();
  });

  it('should render back to login link as anchor tag with correct href', () => {
    render(<ForgotPasswordForm />);

    const loginLink = screen.getByRole('link', { name: /back to login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(loginLink.tagName).toBe('A');
  });
});
