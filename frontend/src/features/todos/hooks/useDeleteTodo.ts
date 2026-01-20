import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTodo } from '../api/todosApi';

/**
 * Custom hook for deleting a todo
 * Automatically invalidates todos query cache on success
 */
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      // Invalidate todos query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
