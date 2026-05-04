import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';

describe('User Authentication', () => {
  describe('POST /api/user/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePassword123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'user@example.com',
          password: 'short',
        });

      expect(response.status).toBe(400);
    });

    it('should fail when email already exists', async () => {
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'existing@example.com',
          password: 'SecurePassword123',
        });

      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'existing@example.com',
          password: 'SecurePassword123',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/user/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123',
        });
    });

    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'SecurePassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe('testuser@example.com');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/user/refresh', () => {
    it('should fail without valid refresh token', async () => {
      const response = await request(app)
        .post('/api/user/refresh');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/user', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'getuser@example.com',
          password: 'SecurePassword123',
        });
      token = response.body.accessToken;
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('getuser@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/user');

      expect(response.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/user/onboarding', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'onboard@example.com',
          password: 'SecurePassword123',
        });
      token = response.body.accessToken;
    });

    it('should update personal data', async () => {
      const response = await request(app)
        .put('/api/user/onboarding')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Juan',
          lastName: 'Pérez',
          nif: '12345678A',
          address: {
            street: 'Calle Principal',
            number: '123',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Juan');
      expect(response.body.lastName).toBe('Pérez');
    });

    it('should fail without authorization', async () => {
      const response = await request(app)
        .put('/api/user/onboarding')
        .send({
          name: 'Juan',
          lastName: 'Pérez',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/user/company', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'company@example.com',
          password: 'SecurePassword123',
        });
      token = response.body.accessToken;
    });

    it('should create/update company data', async () => {
      const response = await request(app)
        .patch('/api/user/company')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Tech Company S.L.',
          cif: 'A12345678',
          isFreelance: false,
          address: {
            street: 'Avenida Tecnológica',
            number: '456',
            postal: '28028',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Tech Company S.L.');
      expect(response.body.cif).toBe('A12345678');
    });
  });

  describe('DELETE /api/user', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'deleteuser@example.com',
          password: 'SecurePassword123',
        });
      token = response.body.accessToken;
    });

    it('should delete user account', async () => {
      const response = await request(app)
        .delete('/api/user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      // Verify user is deleted
      const loginResponse = await request(app)
        .post('/api/user/login')
        .send({
          email: 'deleteuser@example.com',
          password: 'SecurePassword123',
        });

      expect(loginResponse.status).toBe(404);
    });
  });
});
