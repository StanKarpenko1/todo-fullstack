import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
// import { type ReactNode } from 'react';

// Mock the useLogin hook
vi.mock('../hooks/useLogin');

describe('LoginForm', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock - successful state
    vi.mocked(useLogin).mockReturnValue({
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

  it('should render email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should render login button', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<LoginForm />);

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('should call login mutation on form submit with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Fill form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Assert mutation called with form data
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Submit without filling email
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    // Should NOT call mutation
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Type invalid email
    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for empty password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Submit without password
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should disable form and show loading state when submitting', () => {
    // Mock pending state
    vi.mocked(useLogin).mockReturnValue({
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

    render(<LoginForm />);

    // Button should show loading text
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();

    // Button should be disabled
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  it('should display error message when login fails', () => {
    const errorMessage = 'Invalid email or password';

    // Mock error state
    vi.mocked(useLogin).mockReturnValue({
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

    render(<LoginForm />);

    // Should display error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render form with centering layout', () => {
    render(<LoginForm />);

    // Get the container
    const container = screen.getByTestId('login-form-container');
    expect(container).toBeInTheDocument();

    // Check centering mechanism (position: fixed covering viewport + flex centering)
    const styles = window.getComputedStyle(container);
    expect(styles.position).toBe('fixed');
    expect(styles.display).toBe('flex');
    expect(styles.justifyContent).toBe('center');
    expect(styles.alignItems).toBe('center');
  });

  it('should render register link as anchor tag with correct href', () => {
    render(<LoginForm />);

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
    expect(registerLink.tagName).toBe('A');
  });

  it('should render forgot password link as anchor tag with correct href', () => {
    render(<LoginForm />);

    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    expect(forgotPasswordLink.tagName).toBe('A');
  });

  it('should toggle password visibility when clicking visibility button', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Initially password should be hidden (type="password")
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
