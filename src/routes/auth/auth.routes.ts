import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/database';
import { generateToken, hashPassword, comparePassword } from '../../shared/utils/auth.utils';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    name: z.string().optional(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    password: z.string(),
});

/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */
export async function authRoutes(fastify: FastifyInstance) {
    // Register
    fastify.post('/register', async (request, reply) => {
        const body = registerSchema.parse(request.body);

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: body.email },
                    { phoneNumber: body.phoneNumber },
                ],
            },
        });

        if (existingUser) {
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'User already exists',
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(body.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: body.email,
                phoneNumber: body.phoneNumber,
                name: body.name,
                password: hashedPassword,
                provider: 'LOCAL',
            },
        });

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email || undefined,
            phoneNumber: user.phoneNumber || undefined,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                name: user.name,
            },
            token,
        };
    });

    // Login
    fastify.post('/login', async (request, reply) => {
        const body = loginSchema.parse(request.body);

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: body.email },
                    { phoneNumber: body.phoneNumber },
                ],
            },
        });

        if (!user || !user.password) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid credentials',
            });
        }

        // Verify password
        const isPasswordValid = await comparePassword(body.password, user.password);

        if (!isPasswordValid) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Invalid credentials',
            });
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email || undefined,
            phoneNumber: user.phoneNumber || undefined,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                name: user.name,
            },
            token,
        };
    });

    // TODO: Add OAuth routes (Kakao, Google, Apple)
    // Example:
    // fastify.get('/kakao', async (request, reply) => {
    //   // Kakao OAuth login
    // });
}
