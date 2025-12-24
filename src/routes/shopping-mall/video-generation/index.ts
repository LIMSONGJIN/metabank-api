import { FastifyInstance } from 'fastify';
import { optionalAuthMiddleware } from '../../../shared/middleware/auth.middleware';
import { clientIdentifierMiddleware } from '../../../shared/middleware/client-identifier.middleware';
import { usageLogService } from '../../../shared/services/usage-log.service';
import { ClientType, FeatureType } from '../../../shared/types/common';
import { prisma } from '../../../config/database';

export default async function (fastify: FastifyInstance) {
    fastify.post('/', {
        preHandler: [optionalAuthMiddleware, clientIdentifierMiddleware],
    }, async (request, reply) => {
        const body = request.body as any;
        const vfResult = await prisma.virtualFittingResult.findUnique({ where: { id: body.virtualFittingResultId } });
        if (!vfResult) return reply.status(404).send({ error: 'Not Found', message: 'Virtual fitting result not found' });

        const videoResult = { videoUrl: 'https://placeholder.com/video.mp4', thumbnailUrl: 'https://placeholder.com/thumbnail.jpg' };
        const result = await prisma.videoGenerationResult.create({
            data: {
                userId: request.user?.userId,
                clientType: ClientType.SHOPPING_MALL_WEB,
                virtualFittingResultId: body.virtualFittingResultId,
                videoUrl: videoResult.videoUrl,
                thumbnailUrl: videoResult.thumbnailUrl,
                duration: body.duration,
                style: body.style,
                status: 'COMPLETED',
            },
        });
        await usageLogService.createLog({
            userId: request.user?.userId,
            clientType: ClientType.SHOPPING_MALL_WEB,
            featureType: FeatureType.VIDEO_GENERATION,
            sessionId: body.sessionId,
            metadata: { resultId: result.id, virtualFittingResultId: body.virtualFittingResultId, duration: body.duration, style: body.style },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
        });
        return { success: true, videoId: result.id, videoUrl: videoResult.videoUrl, thumbnailUrl: videoResult.thumbnailUrl, status: result.status };
    });
}
