import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TodosPage } from '../TodosPage';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useCreateTodo } from '@/features/todos/hooks/useCreateTodo';
import { useUpdateTodo } from '@/features/todos/hooks/useUpdateTodo';
import { useDeleteTodo } from '@/features/todos/hooks/useDeleteTodo';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { ReactNode } from 'react';

// Mock hooks
vi.mock('@/features/todos/hooks/useTodos');
vi.mock('@/features/todos/hooks/useCreateTodo');
vi.mock('@/features/todos/hooks/useUpdateTodo');
vi.mock('@/features/todos/hooks/useDeleteTodo');
vi.mock('@/shared/contexts/AuthContext');

// Mock components to simplify testing
vi.mock('@/features/todos/components/TodoForm', () => ({
  TodoForm: ({ onSubmit }: any) => (
    <div data-testid="todo-form">
      <button onClick={() => onSubmit({ title: 'Test', description: 'Test' })}>
        Submit Form
      </button>
    </div>
  ),
}));

vi.mock('@/features/todos/components/TodoList', () => ({
  TodoList: ({ todos, onToggle, onDelete }: any) => (
    <div data-testid="todo-list">
      {todos.map((todo: any) => (
        <div key={todo.id} data-testid={`todo-${todo.id}`}>
          <span>{todo.title}</span>
          <button onClick={() => onToggle(todo.id, !todo.completed)}>Toggle</button>
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

describe('TodosPage', () => {
  let queryClient: QueryClient;

  const mockTodos = [
    {
      id: '1',
      title: 'Test Todo',
      description: 'Test Description',
      completed: false,
      userId: 'user-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup default mock return values
    vi.mocked(useTodos).mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCreateTodo).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    vi.mocked(useUpdateTodo).mockReturnValue({
      mutate: vi.fn(),
      error: null,
    } as any);

    vi.mocked(useDeleteTodo).mockReturnValue({
      mutate: vi.fn(),
      error: null,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      logout: vi.fn(),
      login: vi.fn(),
      user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
    });
  });

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  describe('Layout and Centering', () => {
    it('should render with centered container', () => {
      // ARRANGE & ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      const container = screen.getByTestId('todos-page-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      });
    });

    it('should have fixed positioning for full viewport coverage', () => {
      // ARRANGE & ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      const container = screen.getByTestId('todos-page-container');
      expect(container).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
      });
    });

    it('should have overflow auto for scrolling', () => {
      // ARRANGE & ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      const container = screen.getByTestId('todos-page-container');
      expect(container).toHaveStyle({
        overflow: 'auto',
      });
    });
  });

  describe('Logout Button', () => {
    it('should render logout button in upper right corner', () => {
      // ARRANGE & ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      const logoutButton = screen.getByTestId('logout-button');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toHaveTextContent('Logout');
    });

    it('should call logout when logout button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const mockLogout = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        logout: mockLogout,
        login: vi.fn(),
        user: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
        isAuthenticated: true,
      });

      render(<TodosPage />, { wrapper: createWrapper() });

      // ACT
      const logoutButton = screen.getByTestId('logout-button');
      await user.click(logoutButton);

      // ASSERT
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Rendering', () => {
    it('should render page title', () => {
      // ARRANGE & ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByText('My Todos')).toBeInTheDocument();
    });

    it('should render todo form', () => {
      // ARRANGE & ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      expect(screen.getByText('Add New Todo')).toBeInTheDocument();
    });

    it('should render todo list', () => {
      // ARRANGE & ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByTestId('todo-list')).toBeInTheDocument();
      expect(screen.getByText('Todo List')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      // ARRANGE
      vi.mocked(useTodos).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      // ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('My Todos')).not.toBeInTheDocument();
    });

    it('should center loading spinner', () => {
      // ARRANGE
      vi.mocked(useTodos).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      // ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      const container = screen.getByTestId('todos-page-container');
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      });
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      // ARRANGE
      const errorMessage = 'Failed to load todos';
      vi.mocked(useTodos).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
      } as any);

      // ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('My Todos')).not.toBeInTheDocument();
    });

    it('should center error message', () => {
      // ARRANGE
      vi.mocked(useTodos).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Error'),
      } as any);

      // ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      const container = screen.getByTestId('todos-page-container');
      expect(container).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      });
    });
  });

  describe('Todo Operations', () => {
    it('should call createTodo when form is submitted', async () => {
      // ARRANGE
      const user = userEvent.setup();
      const mockMutate = vi.fn();
      vi.mocked(useCreateTodo).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null,
      } as any);

      render(<TodosPage />, { wrapper: createWrapper() });

      // ACT
      await user.click(screen.getByText('Submit Form'));

      // ASSERT
      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test',
        description: 'Test',
      });
    });

    it('should display create error when create fails', () => {
      // ARRANGE
      vi.mocked(useCreateTodo).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        error: new Error('Failed to create todo'),
      } as any);

      // ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByText('Failed to create todo')).toBeInTheDocument();
    });

    it('should display update error when update fails', () => {
      // ARRANGE
      vi.mocked(useUpdateTodo).mockReturnValue({
        mutate: vi.fn(),
        error: new Error('Failed to update todo'),
      } as any);

      // ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByText('Failed to update todo')).toBeInTheDocument();
    });

    it('should display delete error when delete fails', () => {
      // ARRANGE
      vi.mocked(useDeleteTodo).mockReturnValue({
        mutate: vi.fn(),
        error: new Error('Failed to delete todo'),
      } as any);

      // ACT
      render(<TodosPage />, { wrapper: createWrapper() });

      // ASSERT
      expect(screen.getByText('Failed to delete todo')).toBeInTheDocument();
    });
  });
});
