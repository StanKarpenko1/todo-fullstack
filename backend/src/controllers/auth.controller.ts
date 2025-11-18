import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AppError } from '../middleware/errorHandler';

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
