import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Shared hook factory for todo mutations
 * Automatically invalidates the todos cache on success
 *
 * This eliminates code duplication across create/update/delete hooks
 * by centralizing the cache invalidation logic
 *
 * @param mutationFn - The async function that performs the mutation
 * @returns A configured useMutation hook with automatic cache invalidation
 */
export const useTodoMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      // Invalidate todos query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
