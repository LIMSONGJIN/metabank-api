import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { adminMiddleware } from '../../shared/middleware/admin.middleware';

export default async function (fastify: FastifyInstance) {
    fastify.get('/health', {
        preHandler: [authMiddleware, adminMiddleware],
    }, async (request) => {
        return { status: 'ok', message: 'Admin API is working', admin: request.user?.email };
    });

    await fastify.register(import('./stats'), { prefix: '/stats' });
    await fastify.register(import('./usage-logs'), { prefix: '/usage-logs' });
    await fastify.register(import('./users'), { prefix: '/users' });
    await fastify.register(import('./results'), { prefix: '/results' });
}
