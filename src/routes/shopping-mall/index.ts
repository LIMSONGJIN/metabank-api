import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
    fastify.get('/health', async () => ({ status: 'ok', client: 'shopping-mall-web' }));

    await fastify.register(import('./virtual-fitting'), { prefix: '/virtual-fitting' });
    await fastify.register(import('./makeup'), { prefix: '/makeup' });
    await fastify.register(import('./hair-fitting'), { prefix: '/hair-fitting' });
    await fastify.register(import('./video-generation'), { prefix: '/video-generation' });
    await fastify.register(import('./results'), { prefix: '/results' });
}
