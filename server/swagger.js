// server/swagger.js

import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kosh ERP API',
      version: '1.0.0',
      description: 'API documentation for Kosh Enterprise Resource Platform',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local dev server',
      },
      {
        url: 'https://library-management-system-v294.onrender.com',
        description: 'Production server',
      },
    ],
  },
  apis: ['./routers/*.js'], // Adjust this path to where your route files are
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
