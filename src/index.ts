import { createApp } from './app';
import { config } from './config/env';
import { prisma } from './config/database';

/**
 * Start server
 */
async function start() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected');

        // Create and start Fastify app
        const app = await createApp();

        await app.listen({
            port: config.server.port,
            host: '0.0.0.0',
        });

        console.log(`🚀 Server running on http://localhost:${config.server.port}`);
        console.log(`📝 Environment: ${config.server.nodeEnv}`);
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
    try {
        await prisma.$disconnect();
        console.log('👋 Server shut down gracefully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
