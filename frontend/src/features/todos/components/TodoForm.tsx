import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, TextField, Button } from '@mui/material';
import type { CreateTodoData } from '../types/todo.types';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
});

interface TodoFormProps {
  onSubmit: (data: CreateTodoData) => void;
  isSubmitting?: boolean;
}

export const TodoForm = ({ onSubmit, isSubmitting = false }: TodoFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTodoData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmitHandler = (data: CreateTodoData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} sx={{ mb: 3 }}>
      <TextField
        {...register('title')}
        label="Title"
        fullWidth
        margin="normal"
        error={!!errors.title}
        helperText={errors.title?.message}
        disabled={isSubmitting}
      />
      <TextField
        {...register('description')}
        label="Description"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        error={!!errors.description}
        helperText={errors.description?.message}
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        Add Todo
      </Button>
    </Box>
  );
};
