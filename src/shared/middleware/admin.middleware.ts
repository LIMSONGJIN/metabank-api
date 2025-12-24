import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../types/common';

/**
 * Admin Authorization Middleware
 * Verifies that the authenticated user has ADMIN role
 * Must be used after authMiddleware
 */
export async function adminMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    // Check if user is authenticated
    if (!request.user) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required',
        });
    }

    // Check if user has ADMIN role
    if (request.user.role !== UserRole.ADMIN) {
        return reply.status(403).send({
            error: 'Forbidden',
            message: 'Admin access required',
        });
    }
}
