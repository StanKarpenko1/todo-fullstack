import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../../../src/middleware/errorHandler';
import { createMockRequest, createMockResponse } from '../setup';

describe('errorHandler Middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;
  let originalEnv: string | undefined;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = jest.fn();

    // Spy on console.error to verify logging without polluting test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Save original NODE_ENV
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();

    // Restore NODE_ENV
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  // ========================================
  // 1. AppError Handling Tests
  // ========================================
  describe('AppError Handling', () => {
    it('should use AppError statusCode and message', () => {
      // Arrange
      const error = new AppError(404, 'User not found');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });

    it('should respect isOperational flag from AppError', () => {
      // Arrange
      const error = new AppError(400, 'Validation failed', true);

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          statusCode: 400,
          message: 'Validation failed',
          isOperational: true,
        })
      );
    });

    it('should return JSON with error property for AppError', () => {
      // Arrange
      const error = new AppError(403, 'Forbidden');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden',
      });
    });
  });

  // ========================================
  // 2. Generic Error Handling Tests
  // ========================================
  describe('Generic Error Handling', () => {
    it('should default to 500 for non-AppError', () => {
      // Arrange
      const error = new Error('Database connection failed');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return "Internal server error" message for non-AppError', () => {
      // Arrange
      const error = new Error('Unexpected null reference');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    it('should mark non-AppError as non-operational', () => {
      // Arrange
      const error = new Error('Programming bug');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          isOperational: false,
        })
      );
    });
  });

  // ========================================
  // 3. Environment-Based Behavior Tests
  // ========================================
  describe('Environment-Based Stack Trace Handling', () => {
    it('should include stack trace in development for non-operational errors', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const error = new Error('Database crash');
      error.stack = 'Error: Database crash\n    at Connection.query';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        stack: 'Error: Database crash\n    at Connection.query',
      });
    });

    it('should NOT include stack trace in production', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const error = new Error('Database crash');
      error.stack = 'Error: Database crash\n    at Connection.query';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    it('should never expose stack trace for operational errors', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const error = new AppError(404, 'User not found', true);

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({ stack: expect.anything() })
      );
    });
  });

  // ========================================
  // 4. Logging Behavior Tests
  // ========================================
  describe('Logging Behavior', () => {
    it('should log error details with context', () => {
      // Arrange
      const error = new AppError(401, 'Unauthorized');
      req.url = '/api/todos';
      req.method = 'GET';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
          isOperational: true,
          url: '/api/todos',
          method: 'GET',
          timestamp: expect.any(String),
        })
      );
    });

    it('should log request URL and method', () => {
      // Arrange
      const error = new Error('Something broke');
      req.url = '/api/auth/register';
      req.method = 'POST';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          url: '/api/auth/register',
          method: 'POST',
        })
      );
    });

    it('should log stack trace for debugging', () => {
      // Arrange
      const error = new Error('Crash');
      error.stack = 'Error: Crash\n    at controller';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          stack: 'Error: Crash\n    at controller',
        })
      );
    });
  });

  // ========================================
  // 5. Prototype Chain Tests
  // ========================================
  describe('Prototype Chain', () => {
    it('should correctly identify AppError with instanceof', () => {
      // Arrange
      const error = new AppError(400, 'Bad Request');

      // Assert - Verify prototype chain works
      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should maintain Error prototype chain', () => {
      // Arrange
      const error = new AppError(500, 'Server Error');

      // Act
      errorHandler(error, req, res, next);

      // Assert - Middleware should recognize it as AppError
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server Error',
      });
    });
  });

  // ========================================
  // 6. Response Format Consistency Tests
  // ========================================
  describe('Response Format Consistency', () => {
    it('should always return JSON format', () => {
      // Arrange
      const error = new AppError(400, 'Bad Request');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should always have error property in response', () => {
      // Arrange
      const errors = [
        new AppError(404, 'Not Found'),
        new Error('Generic Error'),
        new AppError(403, 'Forbidden'),
      ];

      errors.forEach((error) => {
        // Reset mocks for each iteration
        jest.clearAllMocks();

        // Act
        errorHandler(error, req, res, next);

        // Assert
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(String),
          })
        );
      });
    });

    it('should set status code correctly for various status codes', () => {
      // Arrange
      const testCases = [
        { error: new AppError(422, 'Unprocessable Entity'), expectedStatus: 422 },
        { error: new AppError(409, 'Conflict'), expectedStatus: 409 },
        { error: new Error('Generic'), expectedStatus: 500 },
      ];

      testCases.forEach(({ error, expectedStatus }) => {
        // Reset mocks for each iteration
        jest.clearAllMocks();

        // Act
        errorHandler(error, req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(expectedStatus);
        expect(res.json).toHaveBeenCalled();
      });
    });
  });

  // ========================================
  // 7. Edge Case Tests
  // ========================================
  describe('Edge Cases', () => {
    it('should handle errors without message', () => {
      // Arrange
      const error = new Error();

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });

    it('should handle errors without stack trace', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const error = new Error('No stack');
      error.stack = undefined;

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        stack: undefined,
      });
      expect(consoleErrorSpy).toHaveBeenCalled(); // Should still log
    });
  });
});
