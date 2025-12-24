import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Global Error Handler Middleware
 * Handles all errors in a consistent format
 */
export async function errorHandlerMiddleware(
    error: Error & { statusCode?: number; validation?: any },
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    request.log.error(error);

    const statusCode = error.statusCode || 500;

    // Handle Zod validation errors
    if (error.validation) {
        return reply.status(400).send({
            error: 'Validation Error',
            message: 'Invalid request data',
            details: error.validation,
        });
    }

    // Handle Prisma errors
    if (error.constructor.name.includes('Prisma')) {
        return reply.status(500).send({
            error: 'Database Error',
            message: 'A database error occurred',
        });
    }

    return reply.status(statusCode).send({
        error: error.name || 'Error',
        message: error.message || 'An unexpected error occurred',
    });
}
