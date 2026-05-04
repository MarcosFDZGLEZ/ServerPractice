import request from 'supertest';
import app from '../src/app.js';

describe('DeliveryNote Endpoints', () => {
  let token;
  let clientId;
  let projectId;

  beforeEach(async () => {
    // Register user
    const authResponse = await request(app)
      .post('/api/user/register')
      .send({
        email: `deliverynote-test-${Date.now()}@example.com`,
        password: 'SecurePassword123',
      });

    token = authResponse.body.accessToken;

    // Create company
    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'DeliveryNote Test Company',
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

    // Create client
    const clientResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'DeliveryNote Client',
        cif: `B${Date.now()}`,
        email: 'dnc@example.com',
        phone: '+34912345678',
        address: {
          street: 'Client Street',
          number: '100',
          postal: '28002',
          city: 'Barcelona',
          province: 'Barcelona',
        },
      });

    clientId = clientResponse.body._id;

    // Create project
    const projectResponse = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        name: 'DeliveryNote Project',
        projectCode: `DNP-${Date.now()}`,
        address: {
          street: 'Project Street',
          number: '200',
          postal: '28003',
          city: 'Madrid',
          province: 'Madrid',
        },
        email: 'dnp@example.com',
      });

    projectId = projectResponse.body._id;
  });

  describe('POST /api/deliverynote - Material Format', () => {
    it('should create a delivery note with material format', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'Cement supply for construction',
          workDate: new Date().toISOString(),
          material: 'Portland Cement',
          quantity: 50,
          unit: 'kg',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.format).toBe('material');
      expect(response.body.material).toBe('Portland Cement');
      expect(response.body.quantity).toBe(50);
      expect(response.body.unit).toBe('kg');
    });

    it('should fail without material field for material format', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'Missing material field',
          workDate: new Date().toISOString(),
        });

      expect(response.status).toBe(400);
    });

    it('should fail without quantity field for material format', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'Missing quantity',
          workDate: new Date().toISOString(),
          material: 'Cement',
          unit: 'kg',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/deliverynote - Hours Format', () => {
    it('should create a delivery note with hours format', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'hours',
          description: 'Labor work for construction',
          workDate: new Date().toISOString(),
          hours: 16,
          workers: [
            { name: 'Juan García', hours: 8 },
            { name: 'María López', hours: 8 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.format).toBe('hours');
      expect(response.body.hours).toBe(16);
      expect(response.body.workers).toHaveLength(2);
    });

    it('should fail without workers field for hours format', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'hours',
          description: 'Missing workers',
          workDate: new Date().toISOString(),
          hours: 8,
        });

      expect(response.status).toBe(400);
    });

    it('should fail without hours field for hours format', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'hours',
          description: 'Missing hours',
          workDate: new Date().toISOString(),
          workers: [{ name: 'Juan', hours: 8 }],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/deliverynote', () => {
    beforeEach(async () => {
      // Create test delivery notes
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/deliverynote')
          .set('Authorization', `Bearer ${token}`)
          .send({
            client: clientId,
            project: projectId,
            format: 'material',
            description: `Material ${i}`,
            workDate: new Date().toISOString(),
            material: `Material ${i}`,
            quantity: 10 + i,
            unit: 'kg',
          });
      }
    });

    it('should list all delivery notes', async () => {
      const response = await request(app)
        .get('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should filter delivery notes by project', async () => {
      const response = await request(app)
        .get(`/api/deliverynote?project=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      response.body.forEach(note => {
        expect(note.project).toBe(projectId);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/deliverynote?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/deliverynote/:id', () => {
    let deliveryNoteId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'Get Test Note',
          workDate: new Date().toISOString(),
          material: 'Test Material',
          quantity: 25,
          unit: 'units',
        });

      deliveryNoteId = response.body._id;
    });

    it('should get delivery note by ID', async () => {
      const response = await request(app)
        .get(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(deliveryNoteId);
      expect(response.body.description).toBe('Get Test Note');
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .get('/api/deliverynote/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/deliverynote/:id/sign', () => {
    let deliveryNoteId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'Sign Test Note',
          workDate: new Date().toISOString(),
          material: 'Sign Material',
          quantity: 30,
          unit: 'units',
        });

      deliveryNoteId = response.body._id;
    });

    it('should sign delivery note', async () => {
      // Create a simple base64 signature (canvas-like data)
      const signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await request(app)
        .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          signatureData,
        });

      expect(response.status).toBe(200);
      expect(response.body.signed).toBe(true);
      expect(response.body).toHaveProperty('signedAt');
      expect(response.body).toHaveProperty('pdfPath');
    });

    it('should fail with invalid signature data', async () => {
      const response = await request(app)
        .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          signatureData: 'invalid-signature',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/deliverynote/pdf/:id', () => {
    let deliveryNoteId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'PDF Test Note',
          workDate: new Date().toISOString(),
          material: 'PDF Material',
          quantity: 40,
          unit: 'units',
        });

      deliveryNoteId = createResponse.body._id;

      // Sign the note
      const signatureData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      await request(app)
        .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ signatureData });
    });

    it('should download delivery note PDF', async () => {
      const response = await request(app)
        .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.type).toMatch(/pdf/);
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .get('/api/deliverynote/pdf/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/deliverynote/:id', () => {
    let deliveryNoteId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'Delete Test Note',
          workDate: new Date().toISOString(),
          material: 'Delete Material',
          quantity: 50,
          unit: 'units',
        });

      deliveryNoteId = response.body._id;
    });

    it('should soft delete delivery note', async () => {
      const response = await request(app)
        .delete(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      // Verify note is deleted
      const getResponse = await request(app)
        .get(`/api/deliverynote/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Authorization and Validation', () => {
    it('should fail without authorization token', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .send({
          client: clientId,
          project: projectId,
          format: 'material',
          description: 'Unauthorized',
          workDate: new Date().toISOString(),
          material: 'Material',
          quantity: 10,
          unit: 'kg',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with non-existent client', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: '000000000000000000000000',
          project: projectId,
          format: 'material',
          description: 'Invalid client',
          workDate: new Date().toISOString(),
          material: 'Material',
          quantity: 10,
          unit: 'kg',
        });

      expect(response.status).toBe(404);
    });

    it('should fail with non-existent project', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          project: '000000000000000000000000',
          format: 'material',
          description: 'Invalid project',
          workDate: new Date().toISOString(),
          material: 'Material',
          quantity: 10,
          unit: 'kg',
        });

      expect(response.status).toBe(404);
    });
  });
});
