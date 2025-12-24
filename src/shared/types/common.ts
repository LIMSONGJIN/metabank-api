import { FastifyRequest } from 'fastify';

export enum ClientType {
    KIOSK = 'KIOSK',
    BOGOFIT_APP = 'BOGOFIT_APP',
    SHOPPING_MALL_WEB = 'SHOPPING_MALL_WEB',
    BEAUTY_FIT = 'BEAUTY_FIT',
}

export enum FeatureType {
    VIRTUAL_FITTING = 'VIRTUAL_FITTING',
    MAKEUP = 'MAKEUP',
    HAIR_FITTING = 'HAIR_FITTING',
    VIDEO_GENERATION = 'VIDEO_GENERATION',
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface JWTPayload {
    userId: string;
    email?: string;
    phoneNumber?: string;
    role: UserRole;
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: JWTPayload;
        clientType?: ClientType;
    }
}
