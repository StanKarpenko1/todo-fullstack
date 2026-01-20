import { apiClient } from '@/shared/api/apiClient';
import type {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  TodosResponse,
  TodoResponse,
  DeleteTodoResponse,
} from '../types/todo.types';

/**
 * Fetch all todos for the authenticated user
 */
export const getTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get<TodosResponse>('/todos');
  return response.data.todos;
};

/**
 * Fetch a single todo by ID
 */
export const getTodoById = async (id: string): Promise<Todo> => {
  const response = await apiClient.get<TodoResponse>(`/todos/${id}`);
  return response.data.todo;
};

/**
 * Create a new todo
 */
export const createTodo = async (data: CreateTodoData): Promise<Todo> => {
  const response = await apiClient.post<TodoResponse>('/todos', data);
  return response.data.todo;
};

/**
 * Update an existing todo
 */
export const updateTodo = async (
  id: string,
  data: UpdateTodoData
): Promise<Todo> => {
  const response = await apiClient.put<TodoResponse>(`/todos/${id}`, data);
  return response.data.todo;
};

/**
 * Delete a todo by ID
 */
export const deleteTodo = async (id: string): Promise<void> => {
  await apiClient.delete<DeleteTodoResponse>(`/todos/${id}`);
};
