import { Request, Response, NextFunction } from 'express';

/**
 * Type for async controller functions
 */
type AsyncFunction = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Async Handler Wrapper
 *
 * Wraps async controller functions to automatically catch errors
 * and pass them to the error handler middleware
 *
 * Benefits:
 * - Eliminates need for try/catch in every controller
 * - Ensures all async errors are caught
 * - Cleaner, more readable controller code
 *
 * Usage:
 * export const myController = asyncHandler(async (req, res) => {
 *     // Your code here - errors automatically caught
 *     throw new AppError(400, 'Validation failed'); // Will be caught!
 * });
 */
export const asyncHandler = (fn: AsyncFunction) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
