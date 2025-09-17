import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { AuthenticatedRequest } from '../middleware/auth';

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
export const getTodos = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const todos = await prisma.todo.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            message: 'Todos retrieved successfully',
            todos
        });

    } catch (error) {
        console.error('Get todos error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new todo
export const createTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { error, value } = createTodoSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
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

    } catch (error) {
        console.error('Create todo error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update existing todo
export const updateTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Validate request body
        const { error, value } = updateTodoSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
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
            return res.status(404).json({ error: 'Todo not found' });
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

    } catch (error) {
        console.error('Update todo error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete todo
export const deleteTodo = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check if todo exists and belongs to user
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id,
                userId: req.user!.id
            }
        });

        if (!existingTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Delete todo
        await prisma.todo.delete({
            where: { id }
        });

        res.json({
            message: 'Todo deleted successfully'
        });

    } catch (error) {
        console.error('Delete todo error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};