import { FastifyInstance } from 'fastify';
import { prisma } from '../../../config/database';

export default async function (fastify: FastifyInstance) {
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const [vfResult, makeupResult, hairResult, videoResult] = await Promise.all([
            prisma.virtualFittingResult.findUnique({ where: { id }, include: { videos: true } }),
            prisma.makeupResult.findUnique({ where: { id } }),
            prisma.hairFittingResult.findUnique({ where: { id } }),
            prisma.videoGenerationResult.findUnique({ where: { id }, include: { virtualFittingResult: true } }),
        ]);
        const result = vfResult || makeupResult || hairResult || videoResult;
        if (!result) return reply.status(404).send({ error: 'Result not found' });
        return result;
    });
}
