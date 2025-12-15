import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../controllers/todos.controller';

const router = express.Router();

// Todo routes - All routes require authentication
router.get('/', authenticateToken, getTodos);
router.get('/:id', authenticateToken, getTodoById);
router.post('/', authenticateToken, createTodo);
router.put('/:id', authenticateToken, updateTodo);
router.delete('/:id', authenticateToken, deleteTodo);

export default router;
