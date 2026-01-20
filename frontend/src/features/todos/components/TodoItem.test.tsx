import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types/todo.types';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    userId: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('should render todo title and description', () => {
    // ARRANGE & ACT
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render todo without description', () => {
    // ARRANGE
    const todoWithoutDescription = { ...mockTodo, description: null };

    // ACT
    render(
      <TodoItem todo={todoWithoutDescription} onToggle={vi.fn()} onDelete={vi.fn()} />
    );

    // ASSERT
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should show unchecked checkbox for incomplete todo', () => {
    // ARRANGE & ACT
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should show checked checkbox for completed todo', () => {
    // ARRANGE
    const completedTodo = { ...mockTodo, completed: true };

    // ACT
    render(<TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnToggle = vi.fn();

    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={vi.fn()} />);

    // ACT
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // ASSERT
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith('1', true);
  });

  it('should call onToggle with false when unchecking completed todo', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const completedTodo = { ...mockTodo, completed: true };
    const mockOnToggle = vi.fn();

    render(<TodoItem todo={completedTodo} onToggle={mockOnToggle} onDelete={vi.fn()} />);

    // ACT
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // ASSERT
    expect(mockOnToggle).toHaveBeenCalledWith('1', false);
  });

  it('should call onDelete when delete button is clicked', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockOnDelete = vi.fn();

    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={mockOnDelete} />);

    // ACT
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // ASSERT
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should apply strikethrough style to completed todo', () => {
    // ARRANGE
    const completedTodo = { ...mockTodo, completed: true };

    // ACT
    render(<TodoItem todo={completedTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    const title = screen.getByText('Test Todo');
    expect(title).toHaveStyle({ textDecoration: 'line-through' });
  });

  it('should not apply strikethrough style to incomplete todo', () => {
    // ARRANGE & ACT
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    const title = screen.getByText('Test Todo');
    expect(title).not.toHaveStyle({ textDecoration: 'line-through' });
  });

  it('should render delete button', () => {
    // ARRANGE & ACT
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
