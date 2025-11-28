import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AppError } from '../middleware/errorHandler';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
        'string.empty': 'Reset token is required',
        'any.required': 'Reset token is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.empty': 'New password is required',
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'New password is required'
    })
});

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN as any || '24h' }
    );
};

// Register controller
export const register = async (req: Request, res: Response) => {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
        throw new AppError(400, error.details[0].message);
    }

    const { email, password, name } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new AppError(400, 'User already exists with this email');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
        }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
        message: 'User registered successfully',
        user,
        token
    });
};

// Login controller
export const login = async (req: Request, res: Response) => {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
        throw new AppError(400, error.details[0].message);
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError(400, 'Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new AppError(400, 'Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        token
    });
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
    // 1. Validate email
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
        throw new AppError(400, error.details[0].message);
    }

    const { email } = value;

    // 2. Find user by email
    const user = await prisma.user.findUnique({
        where: { email }
    });

    // 3. Security: Return same message even if user doesn't exist
    if (!user) {
        return res.json({
            message: 'Reset link has been sent'
        });
    }

    // 4. Generate reset token (32 random bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 5. Hash the token before storing (security - never store plaintext)
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // 6. Calculate expiry (1 hour from now)
    const resetTokenExpires = new Date(Date.now() + 3600000);

    // 7. Store hashed token in database
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken: hashedToken,
            resetTokenExpires
        }
    });

    // 8. Return success with plain token (user needs this for reset)
    res.json({
        message: 'Reset link has been sent',
        resetToken  // Plain token (NOT hashed) - user will use this
    });

}

export const resetPassword = async (req: Request, res: Response) => {
    // 1. Validate input (token + newPassword)
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
        throw new AppError(400, error.details[0].message);
    }

    const { token, newPassword } = value;

    // 2. Find user with non-expired reset token
    const user = await prisma.user.findFirst({
        where: {
            resetToken: { not: null },
            resetTokenExpires: { gt: new Date() }
        }
    });

    if (!user) {
        throw new AppError(400, 'Invalid or expired reset token');
    }

    // 3. Verify token matches hash with bcrypt.compare()
    const tokenMatches = await bcrypt.compare(token, user.resetToken!);
    if (!tokenMatches) {
        throw new AppError(400, 'Invalid or expired reset token');
    }

    // 4. Hash new password (12 salt rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 5. Update password and clear reset token fields
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpires: null
        }
    });

    // 6. Return success message
    res.json({
        message: 'Password reset successful'
    });
}
