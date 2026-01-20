import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '../api/todosApi';

/**
 * Custom hook for creating a new todo
 * Automatically invalidates todos query cache on success
 */
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate todos query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
