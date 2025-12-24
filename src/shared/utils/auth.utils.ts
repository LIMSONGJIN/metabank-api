import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../../config/env';
import { JWTPayload } from '../types/common';

const SALT_ROUNDS = 10;

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
