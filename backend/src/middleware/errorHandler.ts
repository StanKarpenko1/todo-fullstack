import { Request, Response, NextFunction } from 'express';

/**
 * Custom Error Class for Operational Errors
 *
 * Operational errors are expected errors that we can anticipate:
 * - Validation failures (400)
 * - Authentication failures (401)
 * - Authorization failures (403)
 * - Not found errors (404)
 * - Business logic errors (400)
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where error was thrown
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Centralized Error Handler Middleware
 *
 * This middleware must be registered LAST in server.ts (after all routes)
 * It catches all errors thrown in controllers and formats consistent responses
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction 
): void => {
    // Default to 500 Internal Server Error
    let statusCode = 500;
    let message = 'Internal server error';
    let isOperational = false;

    // Handle known operational errors (AppError instances)
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }

    // Log error details (for debugging and monitoring)
    console.error('Error occurred:', {
        statusCode,
        message: err.message,
        isOperational,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    // Send error response
    res.status(statusCode).json({
        error: message,
        // Include stack trace in development mode only
        ...(process.env.NODE_ENV === 'development' && !isOperational && {
            stack: err.stack
        }),
    });
};
