import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { adminMiddleware } from '../../../shared/middleware/admin.middleware';
import { prisma } from '../../../config/database';

export default async function (fastify: FastifyInstance) {
    const preHandler = [authMiddleware, adminMiddleware];

    fastify.get('/', { preHandler }, async (request) => {
        const { page = 1, limit = 50, clientType, featureType } = request.query as any;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            prisma.usageLog.findMany({
                where: { clientType: clientType || undefined, featureType: featureType || undefined },
                include: { user: { select: { id: true, email: true, name: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.usageLog.count({ where: { clientType: clientType || undefined, featureType: featureType || undefined } }),
        ]);

        return {
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        };
    });
}
