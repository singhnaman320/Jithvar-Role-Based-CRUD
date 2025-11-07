import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Role-Based Authentication API',
      version: '1.0.0',
      description: 'API documentation for Role-Based Authentication System with CRUD operations',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: process.env.SESSION_NAME || 'rbac_session',
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Roles', description: 'Role management endpoints' },
      { name: 'Permissions', description: 'Permission management endpoints' },
      { name: 'Permission Groups', description: 'Permission group management endpoints' },
      { name: 'Role Permissions', description: 'Role permission mapping endpoints' },
      { name: 'Group Permission Mappings', description: 'Group permission mapping endpoints' },
    ],
  },
  apis: ['./docs/openapi.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger documentation available at http://localhost:${process.env.PORT || 3000}/api-docs`);
};

