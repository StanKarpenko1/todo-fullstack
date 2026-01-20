import {
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Todo } from '../types/todo.types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  return (
    <ListItem
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => onDelete(todo.id)}
        >
          <DeleteIcon />
        </IconButton>
      }
    >
      <Checkbox
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
      />
      <ListItemText
        primary={
          <Typography
            sx={{
              textDecoration: todo.completed ? 'line-through' : 'none',
            }}
          >
            {todo.title}
          </Typography>
        }
        secondary={todo.description}
      />
    </ListItem>
  );
};
