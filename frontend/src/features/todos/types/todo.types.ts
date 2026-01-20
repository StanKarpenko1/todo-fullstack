/**
 * Core Todo type matching backend Prisma model
 */
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new todo
 */
export interface CreateTodoData {
  title: string;
  description?: string;
}

/**
 * Data for updating an existing todo (all fields optional)
 */
export interface UpdateTodoData {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * API response types matching backend controller responses
 */
export interface TodosResponse {
  message: string;
  todos: Todo[];
}

export interface TodoResponse {
  message: string;
  todo: Todo;
}

export interface DeleteTodoResponse {
  message: string;
}
