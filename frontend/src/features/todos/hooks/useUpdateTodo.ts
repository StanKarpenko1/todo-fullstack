import { updateTodo } from '../api/todosApi';
import type { UpdateTodoData } from '../types/todo.types';
import { useTodoMutation } from './useTodoMutation';

/**
 * Custom hook for updating an existing todo
 * Automatically invalidates todos query cache on success
 */
export const useUpdateTodo = () => {
  return useTodoMutation(
    ({ id, data }: { id: string; data: UpdateTodoData }) => updateTodo(id, data)
  );
};
