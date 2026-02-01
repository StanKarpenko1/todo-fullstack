import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../components/TodoForm';

describe('TodoForm', () => {
  it('should render form with title and description fields', () => {
    // ARRANGE & ACT
    render(<TodoForm onSubmit={vi.fn()} />);

    // ASSERT
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data when submitted', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} />);

    // ACT
    await user.type(screen.getByLabelText(/title/i), 'New Todo');
    await user.type(screen.getByLabelText(/description/i), 'New Description');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    // ASSERT
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'New Description',
      });
    });
  });

  it('should call onSubmit with only title when description is empty', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} />);

    // ACT
    await user.type(screen.getByLabelText(/title/i), 'New Todo');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    // ASSERT
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Todo',
        description: '',
      });
    });
  });

  it('should show validation error when title is empty', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} />);

    // ACT
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error when title is too short', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} />);

    // ACT
    await user.type(screen.getByLabelText(/title/i), 'Ab');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    // ASSERT
    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should clear form after successful submission', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(<TodoForm onSubmit={mockOnSubmit} />);

    // ACT
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await user.type(titleInput, 'New Todo');
    await user.type(descriptionInput, 'New Description');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    // ASSERT
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('should disable submit button while submitting', async () => {
    // ARRANGE
    const mockOnSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<TodoForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    // ACT & ASSERT
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show loading state when isSubmitting is true', () => {
    // ARRANGE & ACT
    render(<TodoForm onSubmit={vi.fn()} isSubmitting={true} />);

    // ASSERT
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    expect(submitButton).toBeDisabled();
  });

  it('should allow typing in title field', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);

    // ACT
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test Todo');

    // ASSERT
    expect(titleInput).toHaveValue('Test Todo');
  });

  it('should allow typing in description field', async () => {
    // ARRANGE
    const user = userEvent.setup();
    render(<TodoForm onSubmit={vi.fn()} />);

    // ACT
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test Description');

    // ASSERT
    expect(descriptionInput).toHaveValue('Test Description');
  });
});
