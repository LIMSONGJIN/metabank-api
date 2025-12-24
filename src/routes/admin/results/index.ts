import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { adminMiddleware } from '../../../shared/middleware/admin.middleware';
import { prisma } from '../../../config/database';

export default async function (fastify: FastifyInstance) {
    const preHandler = [authMiddleware, adminMiddleware];

    fastify.get('/virtual-fitting', { preHandler }, async (request) => {
        const { page = 1, limit = 50, clientType } = request.query as any;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [results, total] = await Promise.all([
            prisma.virtualFittingResult.findMany({
                where: { clientType: clientType || undefined },
                include: { videos: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.virtualFittingResult.count({ where: { clientType: clientType || undefined } }),
        ]);
        return { results, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } };
    });

    fastify.get('/makeup', { preHandler }, async (request) => {
        const { page = 1, limit = 50 } = request.query as any;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [results, total] = await Promise.all([
            prisma.makeupResult.findMany({ orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
            prisma.makeupResult.count(),
        ]);
        return { results, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } };
    });

    fastify.get('/hair-fitting', { preHandler }, async (request) => {
        const { page = 1, limit = 50 } = request.query as any;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [results, total] = await Promise.all([
            prisma.hairFittingResult.findMany({ orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
            prisma.hairFittingResult.count(),
        ]);
        return { results, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } };
    });

    fastify.get('/videos', { preHandler }, async (request) => {
        const { page = 1, limit = 50, status } = request.query as any;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [results, total] = await Promise.all([
            prisma.videoGenerationResult.findMany({
                where: { status: status || undefined },
                include: { virtualFittingResult: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.videoGenerationResult.count({ where: { status: status || undefined } }),
        ]);
        return { results, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } };
    });

    fastify.delete('/:type/:id', { preHandler }, async (request, reply) => {
        const { type, id } = request.params as any;
        switch (type) {
            case 'virtual-fitting': await prisma.virtualFittingResult.delete({ where: { id } }); break;
            case 'makeup': await prisma.makeupResult.delete({ where: { id } }); break;
            case 'hair-fitting': await prisma.hairFittingResult.delete({ where: { id } }); break;
            case 'video': await prisma.videoGenerationResult.delete({ where: { id } }); break;
            default: return reply.status(400).send({ error: 'Invalid result type' });
        }
        return { success: true, message: 'Result deleted' };
    });
}
