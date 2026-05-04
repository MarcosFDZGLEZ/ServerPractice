import request from 'supertest';
import express from 'express';
import { protect } from '../src/middleware/auth.middleware.js'; // Adjust path
import { AppError } from '../src/utils/appError.js';
import jwt from 'jsonwebtoken';

// Setup a dummy app to test the middleware in isolation
const app = express();
app.use(express.json());

// A dummy route protected by your middleware
app.get('/test-auth', protect, (req, res) => {
  res.status(200).json({ status: 'success', user: req.user });
});

// Global error handler for the test app
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message
  });
});

describe('Auth Middleware (Protect)', () => {
  it('should fail (401) if no Authorization header is present', async () => {
    const response = await request(app).get('/test-auth');
    
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/logged in/i);
  });

  it('should fail (401) if the token is not a Bearer token', async () => {
    const response = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Basic 12345');

    expect(response.status).toBe(401);
  });

  it('should fail (401) if the token is malformed', async () => {
    const response = await request(app)
      .get('/test-auth')
      .set('Authorization', 'Bearer invalidtokenhere');

    expect(response.status).toBe(401);
  });

  it('should fail (401) if the token is expired', async () => {
    // Create an expired token manually
    const expiredToken = jwt.sign({ id: '123' }, process.env.JWT_SECRET, { expiresIn: '0s' });

    const response = await request(app)
      .get('/test-auth')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });
});