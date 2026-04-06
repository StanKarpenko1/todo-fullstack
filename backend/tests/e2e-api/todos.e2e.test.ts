import request from 'supertest';
import { app } from '../../src/server';
import { cleanDatabase, disconnectDatabase, prisma } from './setup';

describe('Todos API - E2E Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Register and login to get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'todouser@example.com',
        password: 'password123',
        name: 'Todo User',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /api/todos', () => {
    it('should create todo successfully with auth', async () => {
      const todoData = {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Todo created successfully',
        todo: {
          title: todoData.title,
          description: todoData.description,
          completed: false,
          userId: userId,
        },
      });
      expect(response.body.todo.id).toBeDefined();
      expect(response.body.todo.createdAt).toBeDefined();
    });

    it('should create todo without description', async () => {
      const todoData = {
        title: 'Simple todo',
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.todo.title).toBe(todoData.title);
      expect(response.body.todo.description).toBeNull();
    });

    it('should reject todo without title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.error).toContain('title');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Unauthorized todo' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('GET /api/todos', () => {
    it('should get all todos for authenticated user', async () => {
      // Create multiple todos
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo 1' });

      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo 2' });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Todos retrieved successfully');
      expect(Array.isArray(response.body.todos)).toBe(true);
      expect(response.body.todos).toHaveLength(2);
      expect(response.body.todos[0].title).toBeDefined();
    });

    it('should return empty array when user has no todos', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.todos).toEqual([]);
    });

    it('should only return todos belonging to authenticated user', async () => {
      // Create todo for first user
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'User 1 Todo' });

      // Create second user
      const user2Response = await request(app).post('/api/auth/register').send({
        email: 'user2@example.com',
        password: 'password123',
      });

      const user2Token = user2Response.body.token;

      // Create todo for second user
      await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'User 2 Todo' });

      // User 1 should only see their own todo
      const user1Todos = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(user1Todos.body.todos).toHaveLength(1);
      expect(user1Todos.body.todos[0].title).toBe('User 1 Todo');

      // User 2 should only see their own todo
      const user2Todos = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      expect(user2Todos.body.todos).toHaveLength(1);
      expect(user2Todos.body.todos[0].title).toBe('User 2 Todo');
    });
  });

  describe('GET /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test Todo', description: 'Test Description' });

      todoId = response.body.todo.id;
    });

    it('should get todo by id', async () => {
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.todo.id).toBe(todoId);
      expect(response.body.todo.title).toBe('Test Todo');
      expect(response.body.todo.description).toBe('Test Description');
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should prevent user from accessing another users todo', async () => {
      // Create second user
      const user2Response = await request(app).post('/api/auth/register').send({
        email: 'user2@example.com',
        password: 'password123',
      });

      const user2Token = user2Response.body.token;

      // User 2 tries to access User 1's todo
      const response = await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Original Title', description: 'Original Description' });

      todoId = response.body.todo.id;
    });

    it('should update todo title', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.todo.title).toBe('Updated Title');
      expect(response.body.todo.description).toBe('Original Description');
    });

    it('should update todo completion status', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.todo.completed).toBe(true);
    });

    it('should update multiple fields', async () => {
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Title',
          description: 'New Description',
          completed: true,
        })
        .expect(200);

      expect(response.body.todo.title).toBe('New Title');
      expect(response.body.todo.description).toBe('New Description');
      expect(response.body.todo.completed).toBe(true);
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .put(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should prevent user from updating another users todo', async () => {
      // Create second user
      const user2Response = await request(app).post('/api/auth/register').send({
        email: 'user2@example.com',
        password: 'password123',
      });

      const user2Token = user2Response.body.token;

      // User 2 tries to update User 1's todo
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked!' })
        .expect(404);

      expect(response.body.error).toBe('Todo not found');

      // Verify todo was not modified
      const verifyResponse = await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(verifyResponse.body.todo.title).toBe('Original Title');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo to delete' });

      todoId = response.body.todo.id;
    });

    it('should delete todo successfully', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Todo deleted successfully');

      // Verify todo is deleted
      await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/todos/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');
    });

    it('should prevent user from deleting another users todo', async () => {
      // Create second user
      const user2Response = await request(app).post('/api/auth/register').send({
        email: 'user2@example.com',
        password: 'password123',
      });

      const user2Token = user2Response.body.token;

      // User 2 tries to delete User 1's todo
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);

      expect(response.body.error).toBe('Todo not found');

      // Verify todo still exists
      await request(app)
        .get(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
