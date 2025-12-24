import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { JWTPayload } from '../types/common';

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from Authorization header
 */
export async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Missing or invalid authorization header',
            });
        }

        const token = authHeader.replace('Bearer ', '');

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
            request.user = decoded;
        } catch (error) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid or expired token',
            });
        }
    } catch (error) {
        return reply.status(500).send({
            error: 'Internal Server Error',
            message: 'Authentication failed',
        });
    }
}

/**
 * Optional JWT Authentication Middleware
 * Does not throw error if token is missing, but still validates if present
 */
export async function optionalAuthMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
            request.user = decoded;
        } catch (error) {
            // Token is invalid but we don't throw error for optional auth
            request.user = undefined;
        }
    }
}
