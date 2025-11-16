import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Validation schemas
const createTodoSchema = Joi.object({
    title: Joi.string().required().trim().min(1),
    description: Joi.string().optional().allow('').trim()
});

const updateTodoSchema = Joi.object({
    title: Joi.string().optional().trim().min(1),
    description: Joi.string().optional().allow('').trim(),
    completed: Joi.boolean().optional()
});

// Get all todos for authenticated user
export const getTodos = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const todos = await prisma.todo.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' }
    });

    res.json({
        message: 'Todos retrieved successfully',
        todos
    });
});

// Create new todo
export const createTodo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { error, value } = createTodoSchema.validate(req.body);

    if (error) {
        throw new AppError(400, error.details[0].message);
    }

    const { title, description } = value;

    const todo = await prisma.todo.create({
        data: {
            title,
            description: description || null,
            userId: req.user!.id
        }
    });

    res.status(201).json({
        message: 'Todo created successfully',
        todo
    });
});

// Update existing todo
export const updateTodo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Validate request body
    const { error, value } = updateTodoSchema.validate(req.body);
    if (error) {
        throw new AppError(400, error.details[0].message);
    }

    const { id } = req.params;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
        where: {
            id,
            userId: req.user!.id
        }
    });

    if (!existingTodo) {
        throw new AppError(404, 'Todo not found');
    }

    // Update todo
    const updatedTodo = await prisma.todo.update({
        where: { id },
        data: {
            ...value,
            description: value.description || null
        }
    });

    res.json({
        message: 'Todo updated successfully',
        todo: updatedTodo
    });
});

// Delete todo
export const deleteTodo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Check if todo exists and belongs to user
    const existingTodo = await prisma.todo.findFirst({
        where: {
            id,
            userId: req.user!.id
        }
    });

    if (!existingTodo) {
        throw new AppError(404, 'Todo not found');
    }

    // Delete todo
    await prisma.todo.delete({
        where: { id }
    });

    res.json({
        message: 'Todo deleted successfully'
    });
});