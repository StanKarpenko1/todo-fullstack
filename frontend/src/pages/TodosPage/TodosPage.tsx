import { Container, Typography, Paper, Box, CircularProgress, Alert, Button } from '@mui/material';
import { TodoForm } from '@/features/todos/components/TodoForm';
import { TodoList } from '@/features/todos/components/TodoList';
import { useTodos } from '@/features/todos/hooks/useTodos';
import { useCreateTodo } from '@/features/todos/hooks/useCreateTodo';
import { useUpdateTodo } from '@/features/todos/hooks/useUpdateTodo';
import { useDeleteTodo } from '@/features/todos/hooks/useDeleteTodo';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { CreateTodoData } from '@/features/todos/types/todo.types';

export const TodosPage = () => {
  const { data: todos = [], isLoading, error } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const { logout } = useAuth();

  const handleCreate = (data: CreateTodoData) => {
    createTodo.mutate(data);
  };

  const handleToggle = (id: string, completed: boolean) => {
    updateTodo.mutate({ id, data: { completed } });
  };

  const handleDelete = (id: string) => {
    deleteTodo.mutate(id);
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <Box
        data-testid="todos-page-container"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        data-testid="todos-page-container"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load todos'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      data-testid="todos-page-container"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        overflow: 'auto',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Button
          variant="contained"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Logout
        </Button>
      </Box>

      <Container maxWidth="md" sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          My Todos
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Todo
          </Typography>
          <TodoForm onSubmit={handleCreate} isSubmitting={createTodo.isPending} />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Todo List
          </Typography>
          <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
        </Paper>

        {createTodo.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {createTodo.error instanceof Error
              ? createTodo.error.message
              : 'Failed to create todo'}
          </Alert>
        )}

        {updateTodo.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {updateTodo.error instanceof Error
              ? updateTodo.error.message
              : 'Failed to update todo'}
          </Alert>
        )}

        {deleteTodo.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deleteTodo.error instanceof Error
              ? deleteTodo.error.message
              : 'Failed to delete todo'}
          </Alert>
        )}
      </Container>
    </Box>
  );
};
