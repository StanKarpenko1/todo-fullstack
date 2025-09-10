import request from 'supertest';
import { app } from '../src/server';
import { prisma } from './setup';

describe('Todo Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('GET /api/todos', () => {
    it('should return empty todos for new user', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Todos retrieved successfully');
      expect(response.body.todos).toEqual([]);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should return user specific todos', async () => {
      // Create todos for the authenticated user
      await prisma.todo.createMany({
        data: [
          { title: 'Todo 1', userId },
          { title: 'Todo 2', userId }
        ]
      });

      // Create todo for another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User'
        }
      });
      await prisma.todo.create({
        data: { title: 'Other Todo', userId: otherUser.id }
      });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.todos).toHaveLength(2);
      // Check both todos are returned (order may vary due to timing)
      const todoTitles = response.body.todos.map((todo: any) => todo.title).sort();
      expect(todoTitles).toEqual(['Todo 1', 'Todo 2']);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Todo description'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.todo.title).toBe(todoData.title);
      expect(response.body.todo.description).toBe(todoData.description);
      expect(response.body.todo.completed).toBe(false);
      expect(response.body.todo.userId).toBe(userId);
    });

    it('should create todo without description', async () => {
      const todoData = { title: 'Simple Todo' };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.todo.description).toBeNull();
    });

    it('should not create todo with empty title', async () => {
      const todoData = { title: '' };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body.error).toBe('"title" is not allowed to be empty');
    });

    it('should not create todo without title', async () => {
      const todoData = { description: 'Only description' };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body.error).toBe('"title" is required');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'New Todo' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Test Todo', userId }
      });
      todoId = todo.id;
    });

    it('should update todo successfully', async () => {
      const updateData = {
        title: 'Updated Todo',
        description: 'Updated description',
        completed: true
      };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.todo.title).toBe(updateData.title);
      expect(response.body.todo.completed).toBe(true);
    });

    it('should update only title', async () => {
      const updateData = { title: 'Only Title Updated' };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.todo.title).toBe(updateData.title);
      expect(response.body.todo.completed).toBe(false); // Should remain unchanged
    });

    it('should update only completion status', async () => {
      const updateData = { completed: true };

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.todo.completed).toBe(true);
      expect(response.body.todo.title).toBe('Test Todo'); // Should remain unchanged
    });

    it('should not update non-existent todo', async () => {
      const response = await request(app)
        .put('/api/todos/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should not update other users todo', async () => {
      // Create another user and their todo
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User'
        }
      });
      const otherTodo = await prisma.todo.create({
        data: { title: 'Other Todo', userId: otherUser.id }
      });

      const response = await request(app)
        .put(`/api/todos/${otherTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked' })
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should not update with empty title', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.error).toBe('"title" is not allowed to be empty');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      const todo = await prisma.todo.create({
        data: { title: 'Test Todo', userId }
      });
      todoId = todo.id;
    });

    it('should delete todo successfully', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Todo deleted successfully');

      // Verify todo is deleted
      const deletedTodo = await prisma.todo.findUnique({
        where: { id: todoId }
      });
      expect(deletedTodo).toBeNull();
    });

    it('should not delete non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should not delete other users todo', async () => {
      // Create another user and their todo
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User'
        }
      });
      const otherTodo = await prisma.todo.create({
        data: { title: 'Other Todo', userId: otherUser.id }
      });

      const response = await request(app)
        .delete(`/api/todos/${otherTodo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });
});