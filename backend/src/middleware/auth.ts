import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

    // Check if token exists after "Bearer "
    if (!token) {
        throw new AppError(401, 'Access token required');
    }

    try {
        // JWT verification (can throw JsonWebTokenError, TokenExpiredError)
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        // Database lookup (Express 5 catches errors automatically)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true }
        });

        // Throw AppError instead of manual response
        if (!user) {
            throw new AppError(401, 'Invalid token');
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name || undefined
        };

        next(); // Continue middleware chain

    } catch (error: any) {
        // Convert JWT library errors to AppError (401 instead of 500)
        // JWT errors have specific error names (not exported classes, so check by name)
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw new AppError(401, 'Invalid or expired token');
        }
        // Re-throw AppErrors as-is, let Express 5 catch others
        throw error;
    }
};





