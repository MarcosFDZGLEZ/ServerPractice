import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ServerPractice API',
      version: '1.0.0',
      description: 'API for managing users, companies, clients, projects, and delivery notes.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '607f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
            name: {
              type: 'string',
              example: 'Juan',
            },
            lastName: {
              type: 'string',
              example: 'Pérez',
            },
            nif: {
              type: 'string',
              example: '12345678A',
            },
            role: {
              type: 'string',
              enum: ['admin', 'guest'],
              example: 'admin',
            },
            status: {
              type: 'string',
              enum: ['pending', 'verified'],
              example: 'verified',
            },
            company: {
              type: 'string',
              description: 'Company ID reference',
              example: '607f1f77bcf86cd799439012',
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Calle Principal' },
                number: { type: 'string', example: '123' },
                postal: { type: 'string', example: '28001' },
                city: { type: 'string', example: 'Madrid' },
                province: { type: 'string', example: 'Madrid' },
              },
            },
            deleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['email', 'password', 'role'],
        },

        // Company Schema
        Company: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '607f1f77bcf86cd799439012',
            },
            owner: {
              type: 'string',
              description: 'Owner user ID',
              example: '607f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              example: 'Tech Company S.L.',
            },
            cif: {
              type: 'string',
              example: 'A12345678',
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Avenida Tecnológica' },
                number: { type: 'string', example: '456' },
                postal: { type: 'string', example: '28028' },
                city: { type: 'string', example: 'Madrid' },
                province: { type: 'string', example: 'Madrid' },
              },
            },
            logo: {
              type: 'string',
              description: 'URL to company logo',
              example: '/uploads/logos/logo.png',
            },
            isFreelance: {
              type: 'boolean',
              example: false,
            },
            deleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['owner', 'name', 'cif', 'isFreelance'],
        },

        // Client Schema
        Client: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '607f1f77bcf86cd799439013',
            },
            user: {
              type: 'string',
              description: 'User ID',
              example: '607f1f77bcf86cd799439011',
            },
            company: {
              type: 'string',
              description: 'Company ID',
              example: '607f1f77bcf86cd799439012',
            },
            name: {
              type: 'string',
              example: 'Cliente ABC S.L.',
            },
            cif: {
              type: 'string',
              example: 'B87654321',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'contact@clientabc.com',
            },
            phone: {
              type: 'string',
              example: '+34912345678',
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Calle del Cliente' },
                number: { type: 'string', example: '789' },
                postal: { type: 'string', example: '28003' },
                city: { type: 'string', example: 'Madrid' },
                province: { type: 'string', example: 'Madrid' },
              },
            },
            deleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['user', 'company', 'name', 'cif', 'email', 'phone', 'address'],
        },

        // Project Schema
        Project: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '607f1f77bcf86cd799439014',
            },
            user: {
              type: 'string',
              description: 'User ID',
              example: '607f1f77bcf86cd799439011',
            },
            company: {
              type: 'string',
              description: 'Company ID',
              example: '607f1f77bcf86cd799439012',
            },
            client: {
              type: 'string',
              description: 'Client ID',
              example: '607f1f77bcf86cd799439013',
            },
            name: {
              type: 'string',
              example: 'Proyecto Reforma Oficina',
            },
            projectCode: {
              type: 'string',
              example: 'PROJ-2024-001',
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Calle del Proyecto' },
                number: { type: 'string', example: '100' },
                postal: { type: 'string', example: '28004' },
                city: { type: 'string', example: 'Madrid' },
                province: { type: 'string', example: 'Madrid' },
              },
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'project@clientabc.com',
            },
            notes: {
              type: 'string',
              example: 'Proyecto de reforma de interiores',
            },
            active: {
              type: 'boolean',
              example: true,
            },
            deleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['user', 'company', 'client', 'name', 'projectCode', 'address', 'email'],
        },

        // DeliveryNote Schema
        DeliveryNote: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '607f1f77bcf86cd799439015',
            },
            user: {
              type: 'string',
              description: 'User ID',
              example: '607f1f77bcf86cd799439011',
            },
            company: {
              type: 'string',
              description: 'Company ID',
              example: '607f1f77bcf86cd799439012',
            },
            client: {
              type: 'string',
              description: 'Client ID',
              example: '607f1f77bcf86cd799439013',
            },
            project: {
              type: 'string',
              description: 'Project ID',
              example: '607f1f77bcf86cd799439014',
            },
            format: {
              type: 'string',
              enum: ['material', 'hours'],
              example: 'material',
            },
            description: {
              type: 'string',
              example: 'Suministro de materiales para obra',
            },
            workDate: {
              type: 'string',
              format: 'date-time',
            },
            material: {
              type: 'string',
              description: 'Only required if format is material',
              example: 'Cemento Portland',
            },
            quantity: {
              type: 'number',
              description: 'Only required if format is material',
              example: 50,
            },
            unit: {
              type: 'string',
              description: 'Only required if format is material',
              example: 'kg',
            },
            hours: {
              type: 'number',
              description: 'Only required if format is hours',
              example: 8,
            },
            workers: {
              type: 'array',
              description: 'Only required if format is hours',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Juan García' },
                  hours: { type: 'number', example: 8 },
                },
              },
            },
            signed: {
              type: 'boolean',
              example: false,
            },
            signedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the delivery note was signed',
            },
            signatureData: {
              type: 'string',
              description: 'Base64 encoded signature image',
            },
            pdfPath: {
              type: 'string',
              description: 'Path to generated PDF',
              example: '/uploads/deliverynotes/607f1f77bcf86cd799439015.pdf',
            },
            deleted: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['user', 'company', 'client', 'project', 'format', 'description', 'workDate'],
        },

        // Error Schema
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Resource not found',
            },
            status: {
              type: 'integer',
              example: 404,
            },
          },
        },

        // Auth Response
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
    },
    paths: {
      // USER ENDPOINTS
      '/api/user/register': {
        post: {
          tags: ['User'],
          summary: 'Register a new user',
          description: 'Create a new user account with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'SecurePass123' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            400: {
              description: 'Invalid input or validation error',
            },
            409: {
              description: 'Email already exists',
            },
          },
        },
      },
      '/api/user/login': {
        post: {
          tags: ['User'],
          summary: 'Login user',
          description: 'Authenticate user with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', example: 'SecurePass123' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
            },
            404: {
              description: 'User not found',
            },
          },
        },
      },
      '/api/user/refresh': {
        post: {
          tags: ['User'],
          summary: 'Refresh JWT token',
          description: 'Get a new JWT token using the refresh token',
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            401: {
              description: 'Invalid or expired refresh token',
            },
          },
        },
      },
      '/api/user/validation': {
        put: {
          tags: ['User'],
          summary: 'Validate user email',
          description: 'Verify email address with verification code',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    verificationCode: { type: 'string', example: '123456' },
                  },
                  required: ['verificationCode'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Email validated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            400: {
              description: 'Invalid verification code',
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/user': {
        get: {
          tags: ['User'],
          summary: 'Get current user profile',
          description: 'Retrieve the authenticated user profile information',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: {
              description: 'Unauthorized - missing or invalid token',
            },
          },
        },
        delete: {
          tags: ['User'],
          summary: 'Delete user account',
          description: 'Permanently delete the authenticated user account',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User account deleted successfully',
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/user/onboarding': {
        put: {
          tags: ['User'],
          summary: 'Update personal data during onboarding',
          description: 'Complete user profile with personal and address information',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Juan' },
                    lastName: { type: 'string', example: 'Pérez' },
                    nif: { type: 'string', example: '12345678A' },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        number: { type: 'string' },
                        postal: { type: 'string' },
                        city: { type: 'string' },
                        province: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Personal data updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/user/company': {
        patch: {
          tags: ['User'],
          summary: 'Update company data',
          description: 'Create or update company information for the user',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Tech Company S.L.' },
                    cif: { type: 'string', example: 'A12345678' },
                    isFreelance: { type: 'boolean', example: false },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        number: { type: 'string' },
                        postal: { type: 'string' },
                        city: { type: 'string' },
                        province: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Company data updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Company' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/user/logo': {
        patch: {
          tags: ['User'],
          summary: 'Upload company logo',
          description: 'Upload a company logo image',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    logo: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Logo uploaded successfully',
            },
            400: {
              description: 'Invalid file',
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/user/logout': {
        post: {
          tags: ['User'],
          summary: 'Logout user',
          description: 'Invalidate the current JWT token',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logged out successfully',
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/user/invite': {
        post: {
          tags: ['User'],
          summary: 'Invite a new user (Admin only)',
          description: 'Send an invitation to a new user to join the company',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email', example: 'guest@example.com' },
                    role: { type: 'string', enum: ['admin', 'guest'], example: 'guest' },
                  },
                  required: ['email', 'role'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Invitation sent successfully',
            },
            401: {
              description: 'Unauthorized or not admin',
            },
            409: {
              description: 'User already exists',
            },
          },
        },
      },

      // CLIENT ENDPOINTS
      '/api/client': {
        post: {
          tags: ['Client'],
          summary: 'Create a new client',
          description: 'Create a new client in the company',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Cliente ABC S.L.' },
                    cif: { type: 'string', example: 'B87654321' },
                    email: { type: 'string', format: 'email', example: 'contact@clientabc.com' },
                    phone: { type: 'string', example: '+34912345678' },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        number: { type: 'string' },
                        postal: { type: 'string' },
                        city: { type: 'string' },
                        province: { type: 'string' },
                      },
                    },
                  },
                  required: ['name', 'cif', 'email', 'phone', 'address'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Client created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Client' },
                },
              },
            },
            400: {
              description: 'Validation error',
            },
            401: {
              description: 'Unauthorized',
            },
            409: {
              description: 'CIF already exists for this company',
            },
          },
        },
        get: {
          tags: ['Client'],
          summary: 'List all clients',
          description: 'Retrieve all active clients for the company with pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Items per page',
            },
          ],
          responses: {
            200: {
              description: 'Clients retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Client' },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/client/archived': {
        get: {
          tags: ['Client'],
          summary: 'List archived clients',
          description: 'Retrieve all archived (soft deleted) clients for the company',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: {
            200: {
              description: 'Archived clients retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Client' },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/client/{id}': {
        get: {
          tags: ['Client'],
          summary: 'Get client by ID',
          description: 'Retrieve a specific client by its ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Client ID',
            },
          ],
          responses: {
            200: {
              description: 'Client retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Client' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Client not found',
            },
          },
        },
        put: {
          tags: ['Client'],
          summary: 'Update client',
          description: 'Update an existing client information',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    cif: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        number: { type: 'string' },
                        postal: { type: 'string' },
                        city: { type: 'string' },
                        province: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Client updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Client' },
                },
              },
            },
            400: {
              description: 'Validation error',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Client not found',
            },
            409: {
              description: 'CIF already exists',
            },
          },
        },
        delete: {
          tags: ['Client'],
          summary: 'Soft delete client',
          description: 'Archive a client (soft delete)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Client archived successfully',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Client not found',
            },
          },
        },
      },
      '/api/client/{id}/restore': {
        patch: {
          tags: ['Client'],
          summary: 'Restore archived client',
          description: 'Restore a previously archived client',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Client restored successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Client' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Client not found',
            },
          },
        },
      },

      // PROJECT ENDPOINTS
      '/api/project': {
        post: {
          tags: ['Project'],
          summary: 'Create a new project',
          description: 'Create a new project associated with a client',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client: { type: 'string', example: '607f1f77bcf86cd799439013' },
                    name: { type: 'string', example: 'Proyecto Reforma Oficina' },
                    projectCode: { type: 'string', example: 'PROJ-2024-001' },
                    address: {
                      type: 'object',
                      properties: {
                        street: { type: 'string' },
                        number: { type: 'string' },
                        postal: { type: 'string' },
                        city: { type: 'string' },
                        province: { type: 'string' },
                      },
                    },
                    email: { type: 'string', format: 'email' },
                    notes: { type: 'string' },
                  },
                  required: ['client', 'name', 'projectCode', 'address', 'email'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Project created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' },
                },
              },
            },
            400: {
              description: 'Validation error',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Client not found',
            },
            409: {
              description: 'Project code already exists',
            },
          },
        },
        get: {
          tags: ['Project'],
          summary: 'List all projects',
          description: 'Retrieve all active projects for the company with optional filters',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
            {
              name: 'client',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by client ID',
            },
            {
              name: 'active',
              in: 'query',
              schema: { type: 'boolean' },
              description: 'Filter by active status',
            },
          ],
          responses: {
            200: {
              description: 'Projects retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Project' },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/project/archived': {
        get: {
          tags: ['Project'],
          summary: 'List archived projects',
          description: 'Retrieve all archived projects',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
          ],
          responses: {
            200: {
              description: 'Archived projects retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Project' },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/project/{id}': {
        get: {
          tags: ['Project'],
          summary: 'Get project by ID',
          description: 'Retrieve a specific project',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Project retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Project not found',
            },
          },
        },
        put: {
          tags: ['Project'],
          summary: 'Update project',
          description: 'Update an existing project',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    projectCode: { type: 'string' },
                    address: { type: 'object' },
                    email: { type: 'string', format: 'email' },
                    notes: { type: 'string' },
                    active: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Project updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' },
                },
              },
            },
            400: {
              description: 'Validation error',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Project not found',
            },
          },
        },
        delete: {
          tags: ['Project'],
          summary: 'Soft delete project',
          description: 'Archive a project',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Project archived',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Project not found',
            },
          },
        },
      },
      '/api/project/{id}/restore': {
        patch: {
          tags: ['Project'],
          summary: 'Restore archived project',
          description: 'Restore a previously archived project',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Project restored',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Project not found',
            },
          },
        },
      },

      // DELIVERY NOTE ENDPOINTS
      '/api/deliverynote': {
        post: {
          tags: ['DeliveryNote'],
          summary: 'Create a new delivery note',
          description: 'Create a new delivery note (format: material or hours)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    client: { type: 'string' },
                    project: { type: 'string' },
                    format: { type: 'string', enum: ['material', 'hours'] },
                    description: { type: 'string' },
                    workDate: { type: 'string', format: 'date-time' },
                    material: { type: 'string', description: 'Required if format is material' },
                    quantity: { type: 'number', description: 'Required if format is material' },
                    unit: { type: 'string', description: 'Required if format is material' },
                    hours: { type: 'number', description: 'Required if format is hours' },
                    workers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          hours: { type: 'number' },
                        },
                      },
                      description: 'Required if format is hours',
                    },
                  },
                  required: ['client', 'project', 'format', 'description', 'workDate'],
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Delivery note created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeliveryNote' },
                },
              },
            },
            400: {
              description: 'Validation error or missing required fields for format',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Client or project not found',
            },
          },
        },
        get: {
          tags: ['DeliveryNote'],
          summary: 'List delivery notes',
          description: 'Retrieve delivery notes with optional filters',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
            },
            {
              name: 'project',
              in: 'query',
              schema: { type: 'string' },
              description: 'Filter by project ID',
            },
            {
              name: 'startDate',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
            },
            {
              name: 'endDate',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
            },
          ],
          responses: {
            200: {
              description: 'Delivery notes retrieved',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/DeliveryNote' },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/api/deliverynote/{id}': {
        get: {
          tags: ['DeliveryNote'],
          summary: 'Get delivery note by ID',
          description: 'Retrieve a specific delivery note',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Delivery note retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeliveryNote' },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Delivery note not found',
            },
          },
        },
        delete: {
          tags: ['DeliveryNote'],
          summary: 'Delete delivery note',
          description: 'Soft delete a delivery note',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Delivery note deleted',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Delivery note not found',
            },
          },
        },
      },
      '/api/deliverynote/{id}/sign': {
        patch: {
          tags: ['DeliveryNote'],
          summary: 'Sign delivery note',
          description: 'Sign a delivery note with signature data and generate PDF',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    signatureData: {
                      type: 'string',
                      description: 'Base64 encoded signature image',
                    },
                  },
                  required: ['signatureData'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Delivery note signed and PDF generated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeliveryNote' },
                },
              },
            },
            400: {
              description: 'Invalid signature data',
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Delivery note not found',
            },
          },
        },
      },
      '/api/deliverynote/pdf/{id}': {
        get: {
          tags: ['DeliveryNote'],
          summary: 'Download delivery note PDF',
          description: 'Download the PDF for a delivery note. Generates if not exists.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'PDF file downloaded',
              content: {
                'application/pdf': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
            404: {
              description: 'Delivery note not found',
            },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

export default specs;
