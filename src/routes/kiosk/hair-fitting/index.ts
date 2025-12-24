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
        const aiResult = { resultImageUrl: 'https://placeholder.com/hair-result.jpg', processedAt: new Date().toISOString() };
        const result = await prisma.hairFittingResult.create({
            data: {
                userId: request.user?.userId,
                clientType: ClientType.KIOSK,
                originalImageUrl: body.originalImageUrl,
                resultImageUrl: aiResult.resultImageUrl,
                hairStyle: body.hairStyle,
                hairColor: body.hairColor,
            },
        });
        await usageLogService.createLog({
            userId: request.user?.userId,
            clientType: ClientType.KIOSK,
            featureType: FeatureType.HAIR_FITTING,
            sessionId: body.sessionId,
            metadata: { resultId: result.id, hairStyle: body.hairStyle, hairColor: body.hairColor },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
        });
        return { success: true, resultId: result.id, resultImageUrl: aiResult.resultImageUrl, processedAt: aiResult.processedAt };
    });
}
