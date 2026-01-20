import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTodos, getTodoById, createTodo, updateTodo, deleteTodo } from './todosApi';
import { apiClient } from '@/shared/api/apiClient';
import type { Todo, CreateTodoData, UpdateTodoData } from '../types/todo.types';

// Mock apiClient
vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('todosApi', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    userId: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodos', () => {
    it('should fetch all todos and return todos array', async () => {
      // ARRANGE
      const mockResponse = {
        data: {
          message: 'Todos retrieved successfully',
          todos: [mockTodo],
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // ACT
      const result = await getTodos();

      // ASSERT
      expect(apiClient.get).toHaveBeenCalledWith('/todos');
      expect(result).toEqual([mockTodo]);
    });

    it('should return empty array when no todos exist', async () => {
      // ARRANGE
      const mockResponse = {
        data: {
          message: 'Todos retrieved successfully',
          todos: [],
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // ACT
      const result = await getTodos();

      // ASSERT
      expect(result).toEqual([]);
    });
  });

  describe('getTodoById', () => {
    it('should fetch a single todo by id', async () => {
      // ARRANGE
      const mockResponse = {
        data: {
          message: 'Todo retrieved successfully',
          todo: mockTodo,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // ACT
      const result = await getTodoById('1');

      // ASSERT
      expect(apiClient.get).toHaveBeenCalledWith('/todos/1');
      expect(result).toEqual(mockTodo);
    });
  });

  describe('createTodo', () => {
    it('should create a new todo with title and description', async () => {
      // ARRANGE
      const newTodoData: CreateTodoData = {
        title: 'New Todo',
        description: 'New Description',
      };
      const mockResponse = {
        data: {
          message: 'Todo created successfully',
          todo: { ...mockTodo, ...newTodoData },
        },
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // ACT
      const result = await createTodo(newTodoData);

      // ASSERT
      expect(apiClient.post).toHaveBeenCalledWith('/todos', newTodoData);
      expect(result).toEqual(mockResponse.data.todo);
    });

    it('should create a new todo with only title (no description)', async () => {
      // ARRANGE
      const newTodoData: CreateTodoData = {
        title: 'New Todo',
      };
      const mockResponse = {
        data: {
          message: 'Todo created successfully',
          todo: { ...mockTodo, title: 'New Todo', description: null },
        },
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // ACT
      const result = await createTodo(newTodoData);

      // ASSERT
      expect(apiClient.post).toHaveBeenCalledWith('/todos', newTodoData);
      expect(result.description).toBeNull();
    });
  });

  describe('updateTodo', () => {
    it('should update todo title', async () => {
      // ARRANGE
      const updateData: UpdateTodoData = {
        title: 'Updated Title',
      };
      const mockResponse = {
        data: {
          message: 'Todo updated successfully',
          todo: { ...mockTodo, title: 'Updated Title' },
        },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      // ACT
      const result = await updateTodo('1', updateData);

      // ASSERT
      expect(apiClient.put).toHaveBeenCalledWith('/todos/1', updateData);
      expect(result.title).toBe('Updated Title');
    });

    it('should update todo completed status', async () => {
      // ARRANGE
      const updateData: UpdateTodoData = {
        completed: true,
      };
      const mockResponse = {
        data: {
          message: 'Todo updated successfully',
          todo: { ...mockTodo, completed: true },
        },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      // ACT
      const result = await updateTodo('1', updateData);

      // ASSERT
      expect(apiClient.put).toHaveBeenCalledWith('/todos/1', updateData);
      expect(result.completed).toBe(true);
    });

    it('should update multiple fields at once', async () => {
      // ARRANGE
      const updateData: UpdateTodoData = {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true,
      };
      const mockResponse = {
        data: {
          message: 'Todo updated successfully',
          todo: { ...mockTodo, ...updateData },
        },
      };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      // ACT
      const result = await updateTodo('1', updateData);

      // ASSERT
      expect(apiClient.put).toHaveBeenCalledWith('/todos/1', updateData);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
      expect(result.completed).toBe(true);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo by id', async () => {
      // ARRANGE
      const mockResponse = {
        data: {
          message: 'Todo deleted successfully',
        },
      };
      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

      // ACT
      await deleteTodo('1');

      // ASSERT
      expect(apiClient.delete).toHaveBeenCalledWith('/todos/1');
    });

    it('should return void (no return value)', async () => {
      // ARRANGE
      const mockResponse = {
        data: {
          message: 'Todo deleted successfully',
        },
      };
      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse);

      // ACT
      const result = await deleteTodo('1');

      // ASSERT
      expect(result).toBeUndefined();
    });
  });
});
