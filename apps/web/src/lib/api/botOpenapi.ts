export const botOpenApiSpec = {
    openapi: '3.1.0',
    info: {
        title: 'Sub Atomica Bot API',
        version: '1.0.0',
        description: 'LLM-ready task API for Sub Atomica.',
    },
    servers: [
        { url: '/api/v1/bot' },
    ],
    components: {
        securitySchemes: {
            apiKey: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-KEY',
            },
            session: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'BetterAuth',
                description: 'BetterAuth session token if available; otherwise use X-API-KEY.',
            },
        },
        schemas: {
            Task: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    projectId: { type: 'string' },
                    userId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                    priority: { type: 'string', nullable: true },
                    dueDate: { type: 'string', nullable: true },
                    assigneeId: { type: 'string', nullable: true },
                    order: { type: 'number' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                },
            },
        },
    },
    security: [
        { apiKey: [] },
        { session: [] },
    ],
    paths: {
        '/tasks': {
            get: {
                summary: 'List tasks',
                parameters: [
                    { name: 'teamId', in: 'query', schema: { type: 'string' } },
                    { name: 'projectId', in: 'query', schema: { type: 'string' } },
                ],
                responses: {
                    200: {
                        description: 'Tasks list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Task' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: 'Create task',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'projectId'],
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    projectId: { type: 'string' },
                                    status: { type: 'string' },
                                    priority: { type: 'string' },
                                    dueDate: { type: 'string' },
                                    assigneeId: { type: 'string' },
                                    userId: { type: 'string', description: 'Required when using X-API-KEY.' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Created task',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
                    },
                },
            },
        },
        '/tasks/{taskId}': {
            get: {
                summary: 'Get task',
                parameters: [
                    { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: {
                        description: 'Task',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
                    },
                },
            },
            put: {
                summary: 'Update task',
                parameters: [
                    { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    status: { type: 'string' },
                                    priority: { type: 'string' },
                                    dueDate: { type: 'string' },
                                    assigneeId: { type: 'string' },
                                    order: { type: 'number' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Updated task',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
                    },
                },
            },
            delete: {
                summary: 'Delete task',
                parameters: [
                    { name: 'taskId', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    204: { description: 'Deleted task' },
                },
            },
        },
    },
}
