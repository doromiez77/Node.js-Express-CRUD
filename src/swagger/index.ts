import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOption = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API server',
      version: '1.0.0',
      describtion: 'Test API server',
    },
    server: [{ url: 'http://locallhost:3000/api' }],
  },
  apis: ['src/swagger/*'],
};

export const swaggerSpecs = swaggerJsdoc(swaggerOption);

export default swaggerUi;
