import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '../api/todosApi';
import type { UpdateTodoData } from '../types/todo.types';

/**
 * Custom hook for updating an existing todo
 * Automatically invalidates todos query cache on success
 */
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoData }) =>
      updateTodo(id, data),
    onSuccess: () => {
      // Invalidate todos query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
