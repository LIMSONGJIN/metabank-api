import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { config } from './config/env';
import { errorHandlerMiddleware } from './shared/middleware/error-handler.middleware';

// Routes
import { authRoutes } from './routes/auth/auth.routes';
import adminRoutes from './routes/admin';
import kioskRoutes from './routes/kiosk';
import bogofitRoutes from './routes/bogofit';
import shoppingmallRoutes from './routes/shopping-mall';
import beautyfitRoutes from './routes/beautyfit';

/**
 * Create Fastify application
 */
export async function createApp() {
    const fastify = Fastify({
        logger: {
            level: config.server.nodeEnv === 'development' ? 'info' : 'warn',
            transport:
                config.server.nodeEnv === 'development'
                    ? {
                        target: 'pino-pretty',
                        options: {
                            translateTime: 'HH:MM:ss Z',
                            ignore: 'pid,hostname',
                        },
                    }
                    : undefined,
        },
    });

    // Register plugins
    await fastify.register(helmet);
    await fastify.register(compress);
    await fastify.register(cors, {
        origin: config.cors.allowedOrigins,
        credentials: true,
    });

    // Set error handler
    fastify.setErrorHandler(errorHandlerMiddleware);

    // Register routes
    // Auth routes (shared across all clients)
    await fastify.register(authRoutes, { prefix: '/api/v1/auth' });

    // Admin routes (protected)
    await fastify.register(adminRoutes, { prefix: '/api/v1/admin' });

    // Client-specific routes
    await fastify.register(kioskRoutes, { prefix: '/api/v1/kiosk' });
    await fastify.register(bogofitRoutes, { prefix: '/api/v1/bogofit' });
    await fastify.register(shoppingmallRoutes, { prefix: '/api/v1/shopping-mall' });
    await fastify.register(beautyfitRoutes, { prefix: '/api/v1/beautyfit' });

    // Health check (global)
    fastify.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Root route
    fastify.get('/', async () => {
        return {
            name: 'Metabank API',
            version: '1.0.0',
            endpoints: {
                auth: '/api/v1/auth',
                kiosk: '/api/v1/kiosk',
                bogofit: '/api/v1/bogofit',
                shoppingMall: '/api/v1/shopping-mall',
                beautyfit: '/api/v1/beautyfit',
            },
        };
    });

    return fastify;
}
