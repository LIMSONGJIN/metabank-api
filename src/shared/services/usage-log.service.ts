import { prisma } from '../../config/database';
import { ClientType, FeatureType } from '../types/common';

export interface CreateUsageLogData {
    userId?: string;
    clientType: ClientType;
    featureType: FeatureType;
    sessionId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Usage Logging Service
 * Tracks feature usage across different clients
 */
export class UsageLogService {
    /**
     * Create a new usage log entry
     */
    async createLog(data: CreateUsageLogData) {
        return prisma.usageLog.create({
            data: {
                userId: data.userId,
                clientType: data.clientType,
                featureType: data.featureType,
                sessionId: data.sessionId,
                metadata: data.metadata,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }

    /**
     * Get usage logs by user
     */
    async getLogsByUser(userId: string, limit = 50) {
        return prisma.usageLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get usage logs by client type
     */
    async getLogsByClient(clientType: ClientType, limit = 100) {
        return prisma.usageLog.findMany({
            where: { clientType },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get usage logs by feature type
     */
    async getLogsByFeature(featureType: FeatureType, limit = 100) {
        return prisma.usageLog.findMany({
            where: { featureType },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get usage statistics
     */
    async getUsageStats() {
        const [totalLogs, byClient, byFeature] = await Promise.all([
            prisma.usageLog.count(),
            prisma.usageLog.groupBy({
                by: ['clientType'],
                _count: true,
            }),
            prisma.usageLog.groupBy({
                by: ['featureType'],
                _count: true,
            }),
        ]);

        return {
            total: totalLogs,
            byClient,
            byFeature,
        };
    }
}

export const usageLogService = new UsageLogService();
