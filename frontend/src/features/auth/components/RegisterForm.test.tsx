import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from './RegisterForm';
import { useRegister } from '../hooks/useRegister';

// Mock the useRegister hook
vi.mock('../hooks/useRegister');

describe('RegisterForm', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock - successful state
    vi.mocked(useRegister).mockReturnValue({
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

  it('should render name, email and password fields', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should render register button', () => {
    render(<RegisterForm />);

    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should render login link', () => {
    render(<RegisterForm />);

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('should call register mutation on form submit with valid data', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Assert mutation called with form data
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation error for empty name', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    // Submit without name
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    // Submit without email
    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    // Type invalid email
    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for empty password', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    // Submit without password
    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    // Submit with short password
    await user.type(screen.getByLabelText('Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should disable form and show loading state when submitting', () => {
    // Mock pending state
    vi.mocked(useRegister).mockReturnValue({
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

    render(<RegisterForm />);

    // Button should show loading text
    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();

    // Button should be disabled
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });

  it('should display error message when registration fails', () => {
    const errorMessage = 'Email already exists';

    // Mock error state
    vi.mocked(useRegister).mockReturnValue({
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

    render(<RegisterForm />);

    // Should display error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render login link as anchor tag with correct href', () => {
    render(<RegisterForm />);

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(loginLink.tagName).toBe('A');
  });

  it('should toggle password visibility when clicking visibility button', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

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
