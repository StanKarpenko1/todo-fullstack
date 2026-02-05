import { createTodo } from '../api/todosApi';
import { useTodoMutation } from './useTodoMutation';

/**
 * Custom hook for creating a new todo
 * Automatically invalidates todos query cache on success
 */
export const useCreateTodo = () => {
  return useTodoMutation(createTodo);
};
