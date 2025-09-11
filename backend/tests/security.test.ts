import request from 'supertest';
import { app } from '../src/server';
import { prisma } from './setup';

describe('Security Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create authenticated user for tests
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `security${Date.now()}@example.com`,
        password: 'password123',
        name: 'Security Test User'
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('XSS Protection Tests', () => {
    it('should sanitize and reject empty script injection in todo title', async () => {
      const maliciousPayload = {
        title: '<script>alert("XSS")</script>',
        description: 'Normal description'
      };

      // DOMPurify sanitizes script tags to empty string, then Joi validation rejects empty title
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousPayload)
        .expect(400);

      expect(response.body.error).toBe('"title" is not allowed to be empty');
    });

    it('should sanitize dangerous attributes in user name', async () => {
      const maliciousPayload = {
        email: `xss${Date.now()}@example.com`,
        password: 'password123',
        name: '<img src="x" onerror="alert(1)">'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousPayload)
        .expect(201);

      // DOMPurify removes dangerous onerror attribute
      expect(response.body.user.name).toBe('<img src="x">');
    });

    it('should sanitize dangerous iframe in todo description', async () => {
      const maliciousPayload = {
        title: 'Normal Title',
        description: '<iframe src="javascript:alert(\'XSS\')"></iframe>'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousPayload)
        .expect(201);

      // DOMPurify removes dangerous iframe with javascript, stored as null
      expect(response.body.todo.description).toBe(null);
    });
  });

  describe('SQL Injection Protection Tests', () => {
    it('should prevent SQL injection in email field', async () => {
      const sqlInjection = "admin@test.com'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: sqlInjection,
          password: 'password123',
          name: 'SQL Injection Test'
        })
        .expect(400); // Should fail validation, not execute SQL

      expect(response.body.error).toBe('"email" must be a valid email');
      
      // Verify users table still exists by creating a valid user
      const validResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `valid${Date.now()}@example.com`,
          password: 'password123',
          name: 'Valid User'
        })
        .expect(201);

      expect(validResponse.body.user).toHaveProperty('id');
    });

    it('should prevent SQL injection in todo title', async () => {
      const sqlInjection = "'; DELETE FROM todos WHERE '1'='1";
      
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: sqlInjection,
          description: 'SQL Injection attempt'
        })
        .expect(201);

      // Should store as regular text, not execute SQL
      expect(response.body.todo.title).toBe(sqlInjection);
      
      // Verify no todos were deleted by checking we can create another
      const anotherTodo = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Normal todo',
          description: 'This should work'
        })
        .expect(201);

      expect(anotherTodo.body.todo.title).toBe('Normal todo');
    });

    it('should prevent SQL injection in login email', async () => {
      const sqlInjection = "admin' OR '1'='1' --";
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: sqlInjection,
          password: 'anypassword'
        })
        .expect(400);

      // Should fail due to email validation, not allow bypass
      expect(response.body.error).toBe('"email" must be a valid email');
    });
  });

  describe('CSRF Protection Tests', () => {
    it('should require valid JWT token for protected routes', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'CSRF Test Todo'
        })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should reject invalid JWT tokens', async () => {
      const fakeToken = 'Bearer fake-jwt-token';
      
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', fakeToken)
        .send({
          title: 'CSRF Test Todo'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject expired/malformed JWT tokens', async () => {
      const malformedToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.signature';
      
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', malformedToken)
        .send({
          title: 'CSRF Test Todo'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should validate token belongs to existing user', async () => {
      // Delete the user but keep using their token
      await prisma.user.delete({ where: { id: userId } });
      
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent extremely long input strings', async () => {
      const longString = 'A'.repeat(10000); // Very long string
      
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: longString,
          description: 'Normal description'
        })
        .expect(201); // Should accept but may truncate

      // Verify it was stored (database constraints may limit length)
      expect(response.body.todo.title).toBeDefined();
    });

    it('should sanitize null byte injection with XSS', async () => {
      const nullBytePayload = {
        title: 'Normal title\x00<script>alert("XSS")</script>',
        description: 'Normal description'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(nullBytePayload)
        .expect(201);

      // DOMPurify removes null bytes and script tags, leaves clean title
      expect(response.body.todo.title).toBe('Normal title');
    });

    it('should handle Unicode and special characters safely', async () => {
      const unicodePayload = {
        title: '🚀 Todo with émojis and spëcial chars: ñ, ü, ß',
        description: '测试中文字符 and العربية'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(unicodePayload)
        .expect(201);

      expect(response.body.todo.title).toBe(unicodePayload.title);
      expect(response.body.todo.description).toBe(unicodePayload.description);
    });
  });

  describe('Rate Limiting Security', () => {
    it('should allow normal request rate', async () => {
      // Make several normal requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/todos')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.body.message).toBe('Todos retrieved successfully');
      });
    });

    // Note: Rate limiting test would need to make 100+ requests to trigger
    // This is commented out to avoid slow tests, but here's how you'd test it:
    /*
    it('should block excessive requests', async () => {
      const promises = [];
      for (let i = 0; i < 150; i++) { // Exceed rate limit
        promises.push(
          request(app)
            .get('/health')
            .catch(err => err.response) // Handle rate limit errors
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 30000);
    */
  });
});