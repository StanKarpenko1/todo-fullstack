import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthenticatedRequest } from '../src/middleware/auth';
import { prisma } from './setup';

// Create a test app with the middleware
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Protected test route
  app.get('/protected', authenticateToken, (req: AuthenticatedRequest, res) => {
    res.json({ 
      message: 'Access granted', 
      userId: req.user?.id,
      user: req.user 
    });
  });
  
  return app;
};

describe('Auth Middleware', () => {
  let app: express.Application;
  let validToken: string;
  let testUser: any;

  beforeEach(async () => {
    app = createTestApp();
    
    // Create a test user in database
    testUser = await prisma.user.create({
      data: {
        email: 'middleware-test@example.com',
        password: 'hashedpassword',
        name: 'Test User'
      }
    });
    
    // Generate a valid token
    validToken = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  describe('with valid token', () => {
    it('should allow access and attach user to request', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.message).toBe('Access granted');
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.user).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      });
    });
  });

  describe('with missing token', () => {
    it('should deny access when no Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should deny access when Authorization header has no Bearer prefix', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', validToken)
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('with invalid token', () => {
    it('should deny access with malformed token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should deny access with wrong secret signature', async () => {
      const wrongToken = jwt.sign(
        { userId: testUser.id },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${wrongToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should deny access with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser.id },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('with valid token but deleted user', () => {
    it('should deny access when user no longer exists', async () => {
      // Delete the user after token generation
      await prisma.user.delete({ where: { id: testUser.id } });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });
});