import { useQuery } from '@tanstack/react-query';
import { getTodos } from '../api/todosApi';

/**
 * Custom hook for fetching all todos
 * Uses React Query for caching and automatic refetching
 */
export const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });
};
