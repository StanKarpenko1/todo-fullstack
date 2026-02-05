import { deleteTodo } from '../api/todosApi';
import { useTodoMutation } from './useTodoMutation';

/**
 * Custom hook for deleting a todo
 * Automatically invalidates todos query cache on success
 */
export const useDeleteTodo = () => {
  return useTodoMutation(deleteTodo);
};
