import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { adminMiddleware } from '../../../shared/middleware/admin.middleware';
import { usageLogService } from '../../../shared/services/usage-log.service';
import { prisma } from '../../../config/database';

export default async function (fastify: FastifyInstance) {
    const preHandler = [authMiddleware, adminMiddleware];

    fastify.get('/', { preHandler }, async () => {
        const [totalUsers, totalUsageLogs, totalVirtualFittings, totalMakeups, totalHairFittings, totalVideos, usageStats] = await Promise.all([
            prisma.user.count(),
            prisma.usageLog.count(),
            prisma.virtualFittingResult.count(),
            prisma.makeupResult.count(),
            prisma.hairFittingResult.count(),
            prisma.videoGenerationResult.count(),
            usageLogService.getUsageStats(),
        ]);

        return {
            users: { total: totalUsers },
            results: {
                virtualFitting: totalVirtualFittings,
                makeup: totalMakeups,
                hairFitting: totalHairFittings,
                videos: totalVideos,
                total: totalVirtualFittings + totalMakeups + totalHairFittings + totalVideos,
            },
            usage: {
                totalLogs: totalUsageLogs,
                byClient: usageStats.byClient,
                byFeature: usageStats.byFeature,
            },
        };
    });

    fastify.get('/range', { preHandler }, async (request) => {
        const { startDate, endDate } = request.query as any;
        const logs = await prisma.usageLog.findMany({
            where: {
                createdAt: {
                    gte: startDate ? new Date(startDate) : undefined,
                    lte: endDate ? new Date(endDate) : undefined,
                },
            },
            select: { clientType: true, featureType: true, createdAt: true },
        });
        return { logs };
    });
}
