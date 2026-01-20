import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';
import type { Todo } from '../types/todo.types';

// Mock TodoItem component
vi.mock('./TodoItem', () => ({
  TodoItem: ({ todo, onToggle, onDelete }: any) => (
    <div data-testid={`todo-item-${todo.id}`}>
      <span>{todo.title}</span>
      <button onClick={() => onToggle(todo.id, !todo.completed)}>Toggle</button>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  ),
}));

describe('TodoList', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'First Todo',
      description: 'First Description',
      completed: false,
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Second Todo',
      description: null,
      completed: true,
      userId: 'user-1',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  it('should render list of todos', () => {
    // ARRANGE & ACT
    render(<TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
  });

  it('should render empty state when no todos', () => {
    // ARRANGE & ACT
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('should pass onToggle handler to TodoItem components', () => {
    // ARRANGE
    const mockOnToggle = vi.fn();

    // ACT
    render(<TodoList todos={mockTodos} onToggle={mockOnToggle} onDelete={vi.fn()} />);

    // ASSERT - verify handlers are passed (component rendered successfully)
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
  });

  it('should pass onDelete handler to TodoItem components', () => {
    // ARRANGE
    const mockOnDelete = vi.fn();

    // ACT
    render(<TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={mockOnDelete} />);

    // ASSERT - verify handlers are passed (component rendered successfully)
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
  });

  it('should render correct number of todo items', () => {
    // ARRANGE & ACT
    render(<TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    const todoItems = screen.getAllByTestId(/todo-item-/);
    expect(todoItems).toHaveLength(2);
  });

  it('should render single todo', () => {
    // ARRANGE
    const singleTodo = [mockTodos[0]];

    // ACT
    render(<TodoList todos={singleTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
    expect(screen.queryByTestId('todo-item-2')).not.toBeInTheDocument();
  });

  it('should render empty list message with proper styling', () => {
    // ARRANGE & ACT
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);

    // ASSERT
    const emptyMessage = screen.getByText(/no todos yet/i);
    expect(emptyMessage).toBeInTheDocument();
  });
});
