import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';
import Client from '../src/models/Client.js';

const extractResults = (body) => body.clients ?? body;

describe('Client Endpoints', () => {
  let token;
  let userId;
  let companyId;
  let userEmail;

  beforeEach(async () => {
    // Register and setup user
    userEmail = `client-test-${Date.now()}@example.com`;
    const authResponse = await request(app)
      .post('/api/user/register')
      .send({
        email: userEmail,
        password: 'SecurePassword123',
      });

    token = authResponse.body.accessToken;
    userId = authResponse.body.user._id;

    // Create company
    const companyResponse = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Company',
        cif: `A${Date.now()}`,
        isFreelance: false,
        address: {
          street: 'Test Street',
          number: '123',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid',
        },
      });

    expect(companyResponse.status).toBe(200);
    companyId = companyResponse.body._id;

    // Login again to get token with company populated
    const loginResponse = await request(app)
      .post('/api/user/login')
      .send({
        email: userEmail,
        password: 'SecurePassword123',
      });

    expect(loginResponse.status).toBe(200);
    token = loginResponse.body.accessToken;
  });

  describe('POST /api/client', () => {
    it('should create a new client', async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Cliente ABC S.L.',
          cif: 'B87654321',
          email: 'contact@clientabc.com',
          phone: '+34912345678',
          address: {
            street: 'Calle del Cliente',
            number: '789',
            postal: '28003',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Cliente ABC S.L.');
      expect(response.body.cif).toBe('B87654321');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Incomplete Client',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with duplicate CIF', async () => {
      // Create first client
      await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Client One',
          cif: 'C11111111',
          email: 'one@example.com',
          phone: '+34912345678',
          address: {
            street: 'Street 1',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      // Try to create with same CIF
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Client Two',
          cif: 'C11111111',
          email: 'two@example.com',
          phone: '+34912345679',
          address: {
            street: 'Street 2',
            number: '2',
            postal: '28002',
            city: 'Barcelona',
            province: 'Barcelona',
          },
        });

      expect(response.status).toBe(409);
    });

    it('should fail without authorization', async () => {
      const response = await request(app)
        .post('/api/client')
        .send({
          name: 'Unauthorized Client',
          cif: 'D12345678',
          email: 'unauth@example.com',
          phone: '+34912345678',
          address: {
            street: 'Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/client', () => {
    beforeEach(async () => {
      // Create test clients
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/client')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Client ${i}`,
            cif: `E${i}${Date.now()}`,
            email: `client${i}@example.com`,
            phone: '+34912345678',
            address: {
              street: 'Test Street',
              number: String(i),
              postal: '28001',
              city: 'Madrid',
              province: 'Madrid',
            },
          });
      }
    });

    it('should list all active clients', async () => {
      const response = await request(app)
        .get('/api/client')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.clients)).toBe(true);
      expect(response.body.clients.length).toBe(3);
      expect(response.body.results).toBe(3);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/client?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.clients.length).toBeLessThanOrEqual(2);
      expect(response.body.currentPage).toBe(1);
    });

    it('should fail without authorization', async () => {
      const response = await request(app)
        .get('/api/client');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/client/:id', () => {
    let clientId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Single Client',
          cif: 'F98765432',
          email: 'single@example.com',
          phone: '+34912345678',
          address: {
            street: 'Test Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      clientId = response.body._id;
    });

    it('should get client by ID', async () => {
      const response = await request(app)
        .get(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(clientId);
      expect(response.body.name).toBe('Single Client');
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .get('/api/client/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/client/:id', () => {
    let clientId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Update Test Client',
          cif: 'G11111111',
          email: 'update@example.com',
          phone: '+34912345678',
          address: {
            street: 'Old Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      clientId = response.body._id;
    });

    it('should update client', async () => {
      const response = await request(app)
        .put(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Client Name',
          cif: 'G11111111',
          email: 'updated@example.com',
          phone: '+34987654321',
          address: {
            street: 'Updated Street',
            number: '10',
            postal: '28005',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Client Name');
      expect(response.body.email).toBe('updated@example.com');
    });

    it('should fail with invalid ID', async () => {
      const nonExistentId = '65f1a2b3c4d5e6f7a8b9c0d1';
      const response = await request(app)
        .put('/api/client/${nonExistentId}')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/client/:id', () => {
    let clientId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Delete Test Client',
          cif: 'H22222222',
          email: 'delete@example.com',
          phone: '+34912345678',
          address: {
            street: 'Delete Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      clientId = response.body._id;
    });

    it('should hard delete client by default', async () => {
      const response = await request(app)
        .delete(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      // Verify client is not in active list
      const listResponse = await request(app)
        .get('/api/client')
        .set('Authorization', `Bearer ${token}`);

      const found = listResponse.body.clients.find(c => c._id === clientId);
      expect(found).toBeUndefined();
    });

    it('should soft delete client when soft=true', async () => {
      const response = await request(app)
        .delete(`/api/client/${clientId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const archivedResponse = await request(app)
        .get('/api/client/archived')
        .set('Authorization', `Bearer ${token}`);

      const found = archivedResponse.body.clients.find(c => c._id === clientId);
      expect(found).toBeDefined();
    });
  });

  describe('GET /api/client/archived', () => {
    let clientId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Archive Test Client',
          cif: 'I33333333',
          email: 'archive@example.com',
          phone: '+34912345678',
          address: {
            street: 'Archive Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      clientId = response.body._id;

      // Archive the client
      await request(app)
        .delete(`/api/client/${clientId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should list archived clients', async () => {
      const response = await request(app)
        .get('/api/client/archived')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.clients)).toBe(true);
      const found = response.body.clients.find(c => c._id === clientId);
      expect(found).toBeDefined();
    });
  });

  describe('PATCH /api/client/:id/restore', () => {
    let clientId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Restore Test Client',
          cif: 'J44444444',
          email: 'restore@example.com',
          phone: '+34912345678',
          address: {
            street: 'Restore Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
        });

      clientId = response.body._id;

      // Archive the client
      await request(app)
        .delete(`/api/client/${clientId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should restore archived client', async () => {
      const response = await request(app)
        .patch(`/api/client/${clientId}/restore`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(false);

      // Verify client is back in active list
      const listResponse = await request(app)
        .get('/api/client')
        .set('Authorization', `Bearer ${token}`);

      const found = listResponse.body.clients.find(c => c._id === clientId);
      expect(found).toBeDefined();
    });
  });
});
