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
        const aiResult = { resultImageUrl: 'https://placeholder.com/result.jpg', processedAt: new Date().toISOString() };
        const result = await prisma.virtualFittingResult.create({
            data: {
                userId: request.user?.userId,
                clientType: ClientType.BOGOFIT_APP,
                poseImageUrl: body.poseImageUrl,
                resultImageUrl: aiResult.resultImageUrl,
                engine: body.engine || 'v2',
                items: body.items || [],
            },
        });
        await usageLogService.createLog({
            userId: request.user?.userId,
            clientType: ClientType.BOGOFIT_APP,
            featureType: FeatureType.VIRTUAL_FITTING,
            sessionId: body.sessionId,
            metadata: { resultId: result.id, engine: body.engine, itemCount: body.items?.length || 0 },
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
        });
        return { success: true, resultId: result.id, resultImageUrl: aiResult.resultImageUrl, processedAt: aiResult.processedAt };
    });
}
