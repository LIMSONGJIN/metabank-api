import { FastifyRequest, FastifyReply } from 'fastify';
import { ClientType } from '../types/common';

/**
 * Client Identifier Middleware
 * Extracts and validates the client type from the request headers
 */
export async function clientIdentifierMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const clientType = request.headers['x-client-type'] as string;

    if (!clientType) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: 'Missing x-client-type header',
        });
    }

    const validClientTypes = Object.values(ClientType);

    if (!validClientTypes.includes(clientType as ClientType)) {
        return reply.status(400).send({
            error: 'Bad Request',
            message: `Invalid client type. Must be one of: ${validClientTypes.join(', ')}`,
        });
    }

    request.clientType = clientType as ClientType;
}
