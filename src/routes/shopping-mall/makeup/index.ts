import { FastifyInstance } from 'fastify';
import { optionalAuthMiddleware } from '../../../shared/middleware/auth.middleware';
import { clientIdentifierMiddleware } from '../../../shared/middleware/client-identifier.middleware';
import { usageLogService } from '../../../shared/services/usage-log.service';
import { ClientType, FeatureType } from '../../../shared/types/common';
import { prisma } from '../../../config/database';

export default async function (fastify: FastifyInstance) {
    fastify.post('/', {
        preHandler: [optionalAuthMiddleware, clientIdentifierMiddleware],
    }, async (request) => {
        const body = request.body as any;
        const aiResult = { resultImageUrl: 'https://placeholder.com/makeup-result.jpg', processedAt: new Date().toISOString() };
        const result = await prisma.makeupResult.create({
            data: {
                userId: request.user?.userId,
                clientType: ClientType.SHOPPING_MALL_WEB,
                originalImageUrl: body.originalImageUrl,
                resultImageUrl: aiResult.resultImageUrl,
                style: body.style,
            },
        });
        await usageLogService.createLog({
            userId: request.user?.userId,
            clientType: ClientType.SHOPPING_MALL_WEB,
            featureType: FeatureType.MAKEUP,
            sessionId: body.sessionId,
            metadata: { resultId: result.id, style: body.style },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
        });
        return { success: true, resultId: result.id, resultImageUrl: aiResult.resultImageUrl, processedAt: aiResult.processedAt };
    });
}
