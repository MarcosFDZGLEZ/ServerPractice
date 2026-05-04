import request from 'supertest';
import app from '../src/app.js';
import Client from '../src/models/Client.js';

const extractResults = (body) => body.projects ?? body;

describe('Project Endpoints', () => {
  let token;
  let companyId;
  let clientId;
  let userEmail;

  beforeEach(async () => {
    // Register user
    userEmail = `project-test-${Date.now()}@example.com`;
    const authResponse = await request(app)
      .post('/api/user/register')
      .send({
        email: userEmail,
        password: 'SecurePassword123',
      });

    token = authResponse.body.accessToken;

    // Create company
    const companyResponse = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Project Test Company',
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

    // Create client
    const clientResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Project Test Client',
        cif: `B${Date.now()}`,
        email: 'projectclient@example.com',
        phone: '+34912345678',
        address: {
          street: 'Client Street',
          number: '100',
          postal: '28002',
          city: 'Barcelona',
          province: 'Barcelona',
        },
      });

    expect(clientResponse.status).toBe(201);
    clientId = clientResponse.body._id;
  });

  describe('POST /api/project', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Office Renovation Project',
          projectCode: `PROJ-${Date.now()}`,
          address: {
            street: 'Project Street',
            number: '200',
            postal: '28003',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'project@example.com',
          notes: 'Interior renovation project',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Office Renovation Project');
      expect(response.body.client).toBe(clientId);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Incomplete Project',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with non-existent client', async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: '000000000000000000000000',
          name: 'Invalid Client Project',
          projectCode: 'INVALID-001',
          address: {
            street: 'Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'invalid@example.com',
        });

      expect(response.status).toBe(404);
    });

    it('should fail with duplicate project code', async () => {
      const projectCode = `PROJ-UNIQUE-${Date.now()}`;

      // Create first project
      await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'First Project',
          projectCode,
          address: {
            street: 'Street 1',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'project1@example.com',
        });

      // Try to create with same code
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Second Project',
          projectCode,
          address: {
            street: 'Street 2',
            number: '2',
            postal: '28002',
            city: 'Barcelona',
            province: 'Barcelona',
          },
          email: 'project2@example.com',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/project', () => {
    beforeEach(async () => {
      // Create test projects
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/project')
          .set('Authorization', `Bearer ${token}`)
          .send({
            client: clientId,
            name: `Project ${i}`,
            projectCode: `PROJ-${i}-${Date.now()}`,
            address: {
              street: 'Test Street',
              number: String(i),
              postal: '28001',
              city: 'Madrid',
              province: 'Madrid',
            },
            email: `project${i}@example.com`,
          });
      }
    });

    it('should list all active projects', async () => {
      const response = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(response.body.projects.length).toBe(3);
      expect(response.body.results).toBe(3);
    });

    it('should filter projects by client', async () => {
      const response = await request(app)
        .get(`/api/project?client=${clientId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.projects.length).toBe(3);
      response.body.projects.forEach(project => {
        expect(project.client).toBe(clientId);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/project?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.projects.length).toBeLessThanOrEqual(2);
      expect(response.body.currentPage).toBe(1);
    });
  });

  describe('GET /api/project/:id', () => {
    let projectId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Get Project Test',
          projectCode: `GET-${Date.now()}`,
          address: {
            street: 'Test Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'getproject@example.com',
        });

      projectId = response.body._id;
    });

    it('should get project by ID', async () => {
      const response = await request(app)
        .get(`/api/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(projectId);
      expect(response.body.name).toBe('Get Project Test');
    });

    it('should fail with invalid ID', async () => {
      const response = await request(app)
        .get('/api/project/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/project/:id', () => {
    let projectId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Update Project Test',
          projectCode: `UPDATE-${Date.now()}`,
          address: {
            street: 'Old Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'updateproject@example.com',
        });

      projectId = response.body._id;
    });

    it('should update project', async () => {
      const response = await request(app)
        .put(`/api/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Updated Project Name',
          projectCode: `UPDATE-${Date.now()}`,
          address: {
            street: 'Updated Street',
            number: '10',
            postal: '28005',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'updatedproject@example.com',
          notes: 'Updated notes',
          active: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Project Name');
      expect(response.body.active).toBe(false);
    });
  });

  describe('DELETE /api/project/:id', () => {
    let projectId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Delete Project Test',
          projectCode: `DELETE-${Date.now()}`,
          address: {
            street: 'Delete Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'deleteproject@example.com',
        });

      projectId = response.body._id;
    });

    it('should hard delete project by default', async () => {
      const response = await request(app)
        .delete(`/api/project/${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const listResponse = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${token}`);

      const found = listResponse.body.projects.find(p => p._id === projectId);
      expect(found).toBeUndefined();
    });

    it('should soft delete project when soft=true', async () => {
      const response = await request(app)
        .delete(`/api/project/${projectId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);

      const archivedResponse = await request(app)
        .get('/api/project/archived')
        .set('Authorization', `Bearer ${token}`);

      const found = archivedResponse.body.projects.find(p => p._id === projectId);
      expect(found).toBeDefined();
    });
  });

  describe('GET /api/project/archived', () => {
    let projectId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Archive Project Test',
          projectCode: `ARCHIVE-${Date.now()}`,
          address: {
            street: 'Archive Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'archiveproject@example.com',
        });

      projectId = response.body._id;

      // Archive the project
      await request(app)
        .delete(`/api/project/${projectId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should list archived projects', async () => {
      const response = await request(app)
        .get('/api/project/archived')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.projects)).toBe(true);
      const found = response.body.projects.find(p => p._id === projectId);
      expect(found).toBeDefined();
    });
  });

  describe('PATCH /api/project/:id/restore', () => {
    let projectId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          client: clientId,
          name: 'Restore Project Test',
          projectCode: `RESTORE-${Date.now()}`,
          address: {
            street: 'Restore Street',
            number: '1',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid',
          },
          email: 'restoreproject@example.com',
        });

      projectId = response.body._id;

      // Archive the project
      await request(app)
        .delete(`/api/project/${projectId}?soft=true`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should restore archived project', async () => {
      const response = await request(app)
        .patch(`/api/project/${projectId}/restore`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(false);

      const listResponse = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${token}`);

      const found = listResponse.body.projects.find(p => p._id === projectId);
      expect(found).toBeDefined();
    });
  });
});
