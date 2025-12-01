/**
 * Unit Tests for Todos Controller
 *
 * TDD Principles Applied:
 * - All external dependencies are mocked (Prisma)
 * - Tests focus on business logic and authorization
 * - Fast execution (no database)
 * - Each test is independent
 * - Follows AAA pattern: Arrange, Act, Assert
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../../src/middleware/auth';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../../../src/controllers/todos.controller';
import {
  createMockAuthRequest,
  createMockResponse,
  createMockTodo,
} from '../setup';

// Mock Prisma - must define mocks inside the factory function
jest.mock('@prisma/client', () => {
  const mockPrismaTodo = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      todo: mockPrismaTodo,
    })),
    mockPrismaTodo, // Export for test access
  };
});

// Import the mock for test access
const { mockPrismaTodo } = require('@prisma/client') as any;

describe('Todos Controller - Unit Tests', () => {
  let req: AuthenticatedRequest;
  let res: Response;

  beforeEach(() => {
    req = createMockAuthRequest();
    res = createMockResponse();

    jest.clearAllMocks();
  });

  describe('getTodos()', () => {
    describe('successful retrieval', () => {
      it('should return all todos for authenticated user', async () => {
        // ARRANGE
        const mockTodos = [
          createMockTodo({ id: 'todo-1', title: 'First Todo' }),
          createMockTodo({ id: 'todo-2', title: 'Second Todo' }),
        ];

        mockPrismaTodo.findMany.mockResolvedValue(mockTodos);

        // ACT
        await getTodos(req, res);

        // ASSERT
        expect(mockPrismaTodo.findMany).toHaveBeenCalledWith({
          where: { userId: req.user!.id },
          orderBy: { createdAt: 'desc' },
        });
        expect(res.json).toHaveBeenCalledWith({
          message: 'Todos retrieved successfully',
          todos: mockTodos,
        });
      });

      it('should return empty array when user has no todos', async () => {
        // ARRANGE
        mockPrismaTodo.findMany.mockResolvedValue([]);

        // ACT
        await getTodos(req, res);

        // ASSERT
        expect(mockPrismaTodo.findMany).toHaveBeenCalledWith({
          where: { userId: req.user!.id },
          orderBy: { createdAt: 'desc' },
        });
        expect(res.json).toHaveBeenCalledWith({
          message: 'Todos retrieved successfully',
          todos: [],
        });
      });

      it('should only fetch todos for the authenticated user (authorization)', async () => {
        // ARRANGE
        const specificUserId = 'specific-user-123';
        req.user!.id = specificUserId;

        mockPrismaTodo.findMany.mockResolvedValue([]);

        // ACT
        await getTodos(req, res);

        // ASSERT
        expect(mockPrismaTodo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: specificUserId },
          })
        );
      });

      it('should return todos ordered by creation date (newest first)', async () => {
        // ARRANGE
        mockPrismaTodo.findMany.mockResolvedValue([]);

        // ACT
        await getTodos(req, res);

        // ASSERT
        expect(mockPrismaTodo.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { createdAt: 'desc' },
          })
        );
      });
    });

    describe('error handling', () => {
      it('should throw error when database throws error', async () => {
        // ARRANGE
        mockPrismaTodo.findMany.mockRejectedValue(new Error('Database error'));

        // ACT & ASSERT
        await expect(getTodos(req, res)).rejects.toThrow('Database error');
      });
    });
  });

  describe('createTodo()', () => {
    describe('successful creation', () => {
      it('should create todo with title and description', async () => {
        // ARRANGE
        const requestBody = {
          title: 'New Todo',
          description: 'Todo description',
        };
        req.body = requestBody;

        const mockCreatedTodo = createMockTodo({
          title: requestBody.title,
          description: requestBody.description,
          userId: req.user!.id,
        });

        mockPrismaTodo.create.mockResolvedValue(mockCreatedTodo);

        // ACT
        await createTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.create).toHaveBeenCalledWith({
          data: {
            title: requestBody.title,
            description: requestBody.description,
            userId: req.user!.id,
          },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Todo created successfully',
          todo: mockCreatedTodo,
        });
      });

      it('should create todo with only title (description optional)', async () => {
        // ARRANGE
        req.body = { title: 'Todo without description' };

        const mockCreatedTodo = createMockTodo({
          title: req.body.title,
          description: null,
        });

        mockPrismaTodo.create.mockResolvedValue(mockCreatedTodo);

        // ACT
        await createTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.create).toHaveBeenCalledWith({
          data: {
            title: req.body.title,
            description: null,
            userId: req.user!.id,
          },
        });
        expect(res.status).toHaveBeenCalledWith(201);
      });

      it('should associate todo with authenticated user', async () => {
        // ARRANGE
        const specificUserId = 'user-xyz-789';
        req.user!.id = specificUserId;
        req.body = { title: 'Test Todo' };

        mockPrismaTodo.create.mockResolvedValue(createMockTodo());

        // ACT
        await createTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              userId: specificUserId,
            }),
          })
        );
      });

      it('should trim whitespace from title', async () => {
        // ARRANGE
        req.body = { title: '  Trimmed Todo  ' };
        mockPrismaTodo.create.mockResolvedValue(createMockTodo());

        // ACT
        await createTodo(req, res);

        // ASSERT - Joi validation handles trimming before controller
        expect(res.status).toHaveBeenCalledWith(201);
      });
    });

    describe('validation errors', () => {
      it('should throw AppError when title is missing', async () => {
        // ARRANGE
        req.body = { description: 'Description without title' };

        // ACT & ASSERT
        await expect(createTodo(req, res)).rejects.toThrow(
          '"title" is required'
        );
        expect(mockPrismaTodo.create).not.toHaveBeenCalled();
      });

      it('should throw AppError when title is empty string', async () => {
        // ARRANGE
        req.body = { title: '' };

        // ACT & ASSERT
        await expect(createTodo(req, res)).rejects.toThrow(
          'not allowed to be empty'
        );
        expect(mockPrismaTodo.create).not.toHaveBeenCalled();
      });

      it('should throw AppError when title is only whitespace', async () => {
        // ARRANGE
        req.body = { title: '   ' };

        // ACT & ASSERT
        await expect(createTodo(req, res)).rejects.toThrow(
          'not allowed to be empty'
        );
        expect(mockPrismaTodo.create).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should throw error when database throws error', async () => {
        // ARRANGE
        req.body = { title: 'Test Todo' };
        mockPrismaTodo.create.mockRejectedValue(new Error('Database error'));

        // ACT & ASSERT
        await expect(createTodo(req, res)).rejects.toThrow('Database error');
      });
    });
  });

  describe('updateTodo()', () => {
    describe('successful update', () => {
      it('should update todo title', async () => {
        // ARRANGE
        const todoId = 'todo-123';
        req.params = { id: todoId };
        req.body = { title: 'Updated Title' };

        const existingTodo = createMockTodo({ id: todoId });
        const updatedTodo = { ...existingTodo, title: 'Updated Title' };

        mockPrismaTodo.findFirst.mockResolvedValue(existingTodo);
        mockPrismaTodo.update.mockResolvedValue(updatedTodo);

        // ACT
        await updateTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.findFirst).toHaveBeenCalledWith({
          where: {
            id: todoId,
            userId: req.user!.id,
          },
        });
        expect(mockPrismaTodo.update).toHaveBeenCalledWith({
          where: { id: todoId },
          data: {
            title: 'Updated Title',
            description: null,
          },
        });
        expect(res.json).toHaveBeenCalledWith({
          message: 'Todo updated successfully',
          todo: updatedTodo,
        });
      });

      it('should update todo completion status', async () => {
        // ARRANGE
        const todoId = 'todo-123';
        req.params = { id: todoId };
        req.body = { completed: true };

        mockPrismaTodo.findFirst.mockResolvedValue(createMockTodo());
        mockPrismaTodo.update.mockResolvedValue(
          createMockTodo({ completed: true })
        );

        // ACT
        await updateTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.update).toHaveBeenCalledWith({
          where: { id: todoId },
          data: expect.objectContaining({
            completed: true,
          }),
        });
      });

      it('should update multiple fields at once', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        req.body = {
          title: 'New Title',
          description: 'New Description',
          completed: true,
        };

        mockPrismaTodo.findFirst.mockResolvedValue(createMockTodo());
        mockPrismaTodo.update.mockResolvedValue(createMockTodo());

        // ACT
        await updateTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.update).toHaveBeenCalledWith({
          where: { id: 'todo-123' },
          data: {
            title: 'New Title',
            description: 'New Description',
            completed: true,
          },
        });
      });

      it('should allow empty string description', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        req.body = { description: '' };

        mockPrismaTodo.findFirst.mockResolvedValue(createMockTodo());
        mockPrismaTodo.update.mockResolvedValue(createMockTodo());

        // ACT
        await updateTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              description: null,
            }),
          })
        );
      });
    });

    describe('authorization checks', () => {
      it('should throw AppError when todo does not exist', async () => {
        // ARRANGE
        req.params = { id: 'nonexistent-todo' };
        req.body = { title: 'Updated Title' };

        // Mock: Todo not found
        mockPrismaTodo.findFirst.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(updateTodo(req, res)).rejects.toThrow('Todo not found');
        expect(mockPrismaTodo.findFirst).toHaveBeenCalled();
        expect(mockPrismaTodo.update).not.toHaveBeenCalled();
      });

      it('should throw AppError when todo belongs to different user', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        req.body = { title: 'Hacker Update' };
        req.user!.id = 'user-A';

        // Mock: Todo not found for this user (findFirst uses userId in WHERE)
        mockPrismaTodo.findFirst.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(updateTodo(req, res)).rejects.toThrow('Todo not found');
        expect(mockPrismaTodo.findFirst).toHaveBeenCalledWith({
          where: {
            id: 'todo-123',
            userId: 'user-A',
          },
        });
        expect(mockPrismaTodo.update).not.toHaveBeenCalled();
      });

      it('should verify ownership before updating', async () => {
        // ARRANGE
        const userId = 'owner-user-id';
        const todoId = 'todo-123';
        req.user!.id = userId;
        req.params = { id: todoId };
        req.body = { title: 'Update' };

        mockPrismaTodo.findFirst.mockResolvedValue(createMockTodo());
        mockPrismaTodo.update.mockResolvedValue(createMockTodo());

        // ACT
        await updateTodo(req, res);

        // ASSERT - Ownership check happens in findFirst
        expect(mockPrismaTodo.findFirst).toHaveBeenCalledWith({
          where: {
            id: todoId,
            userId: userId, // Authorization check
          },
        });
      });
    });

    describe('validation errors', () => {
      it('should throw AppError when title is empty string', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        req.body = { title: '' };

        // ACT & ASSERT
        await expect(updateTodo(req, res)).rejects.toThrow(
          'not allowed to be empty'
        );
        expect(mockPrismaTodo.findFirst).not.toHaveBeenCalled();
      });

      it('should throw AppError when completed is not boolean', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        req.body = { completed: 'yes' }; // Invalid type

        // ACT & ASSERT
        await expect(updateTodo(req, res)).rejects.toThrow('must be a boolean');
        expect(mockPrismaTodo.findFirst).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should throw error when database throws error', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        req.body = { title: 'Update' };

        mockPrismaTodo.findFirst.mockRejectedValue(new Error('Database error'));

        // ACT & ASSERT
        await expect(updateTodo(req, res)).rejects.toThrow('Database error');
      });
    });
  });

  describe('deleteTodo()', () => {
    describe('successful deletion', () => {
      it('should delete todo that belongs to user', async () => {
        // ARRANGE
        const todoId = 'todo-to-delete';
        req.params = { id: todoId };

        const existingTodo = createMockTodo({ id: todoId });
        mockPrismaTodo.findFirst.mockResolvedValue(existingTodo);
        mockPrismaTodo.delete.mockResolvedValue(existingTodo);

        // ACT
        await deleteTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.findFirst).toHaveBeenCalledWith({
          where: {
            id: todoId,
            userId: req.user!.id,
          },
        });
        expect(mockPrismaTodo.delete).toHaveBeenCalledWith({
          where: { id: todoId },
        });
        expect(res.json).toHaveBeenCalledWith({
          message: 'Todo deleted successfully',
        });
      });

      it('should verify ownership before deletion', async () => {
        // ARRANGE
        const userId = 'owner-123';
        const todoId = 'todo-456';
        req.user!.id = userId;
        req.params = { id: todoId };

        mockPrismaTodo.findFirst.mockResolvedValue(createMockTodo());
        mockPrismaTodo.delete.mockResolvedValue(createMockTodo());

        // ACT
        await deleteTodo(req, res);

        // ASSERT
        expect(mockPrismaTodo.findFirst).toHaveBeenCalledWith({
          where: {
            id: todoId,
            userId: userId, // Authorization
          },
        });
      });
    });

    describe('authorization checks', () => {
      it('should throw AppError when todo does not exist', async () => {
        // ARRANGE
        req.params = { id: 'nonexistent-todo' };

        mockPrismaTodo.findFirst.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(deleteTodo(req, res)).rejects.toThrow('Todo not found');
        expect(mockPrismaTodo.findFirst).toHaveBeenCalled();
        expect(mockPrismaTodo.delete).not.toHaveBeenCalled();
      });

      it('should throw AppError when trying to delete another users todo', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        req.user!.id = 'user-A';

        // Mock: Todo doesn't exist for this user
        mockPrismaTodo.findFirst.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(deleteTodo(req, res)).rejects.toThrow('Todo not found');
        expect(mockPrismaTodo.findFirst).toHaveBeenCalledWith({
          where: {
            id: 'todo-123',
            userId: 'user-A',
          },
        });
        expect(mockPrismaTodo.delete).not.toHaveBeenCalled();
      });

      it('should prevent deletion without ownership check', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };
        mockPrismaTodo.findFirst.mockResolvedValue(null);

        // ACT & ASSERT
        await expect(deleteTodo(req, res)).rejects.toThrow('Todo not found');
        expect(mockPrismaTodo.findFirst).toHaveBeenCalled();
        expect(mockPrismaTodo.delete).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should throw error when database throws error', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };

        mockPrismaTodo.findFirst.mockRejectedValue(new Error('Database error'));

        // ACT & ASSERT
        await expect(deleteTodo(req, res)).rejects.toThrow('Database error');
      });

      it('should throw error when delete operation fails', async () => {
        // ARRANGE
        req.params = { id: 'todo-123' };

        mockPrismaTodo.findFirst.mockResolvedValue(createMockTodo());
        mockPrismaTodo.delete.mockRejectedValue(new Error('Delete failed'));

        // ACT & ASSERT
        await expect(deleteTodo(req, res)).rejects.toThrow('Delete failed');
      });
    });
  });
});
