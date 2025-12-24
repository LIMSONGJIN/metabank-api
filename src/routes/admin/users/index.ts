import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { adminMiddleware } from '../../../shared/middleware/admin.middleware';
import { prisma } from '../../../config/database';

export default async function (fastify: FastifyInstance) {
    const preHandler = [authMiddleware, adminMiddleware];

    fastify.get('/', { preHandler }, async (request) => {
        const { page = 1, limit = 50 } = request.query as any;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true, email: true, phoneNumber: true, name: true, role: true, provider: true, createdAt: true,
                    _count: { select: { usageLogs: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.user.count(),
        ]);

        return { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } };
    });

    fastify.get('/:id', { preHandler }, async (request, reply) => {
        const { id } = request.params as any;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true, email: true, phoneNumber: true, name: true, role: true, provider: true, createdAt: true, updatedAt: true,
                usageLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
            },
        });
        if (!user) return reply.status(404).send({ error: 'User not found' });
        return user;
    });

    fastify.patch('/:id/role', { preHandler }, async (request) => {
        const { id } = request.params as any;
        const { role } = request.body as any;
        return prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, role: true },
        });
    });
}
