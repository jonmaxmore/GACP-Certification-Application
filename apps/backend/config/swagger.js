const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GACP Certification API',
            version: '2.0.0',
            description: 'API Documentation for GACP Certification Platform',
            contact: {
                name: 'GACP Support',
                email: 'support@gacp.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001/api/v2',
                description: 'Development Server',
            },
            {
                url: 'http://localhost:3001',
                description: 'Root Server (for Auth)',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'User ID' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        role: { type: 'string', enum: ['farmer', 'auditor', 'admin'] },
                        status: { type: 'string', enum: ['pending', 'active', 'suspended'] },
                    },
                },
                Establishment: {
                    type: 'object',
                    required: ['name', 'address', 'owner'],
                    properties: {
                        id: { type: 'string', description: 'Establishment ID' },
                        name: { type: 'string' },
                        type: { type: 'string', enum: ['CULTIVATION', 'PROCESSING', 'DISTRIBUTION'] },
                        address: {
                            type: 'object',
                            properties: {
                                street: { type: 'string' },
                                city: { type: 'string' },
                                zipCode: { type: 'string' },
                            },
                        },
                        status: { type: 'string' },
                    },
                },
                Application: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { type: 'string' },
                        status: { type: 'string' },
                        submissionDate: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    // Ensure we pick up docs from routes and controllers
    apis: [
        path.join(__dirname, '../routes/**/*.js'),
        path.join(__dirname, '../controllers/**/*.js'),
        path.join(__dirname, '../server.js')
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

