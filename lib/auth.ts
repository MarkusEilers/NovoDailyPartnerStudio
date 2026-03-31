import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { Partner } from './kv';

const JWT_SECRET = process.env.JWT_SECRET || 'ndps-secret-2026';
const SALT_ROUNDS = 10;

/* ============================================
   Password Functions
   ============================================ */

export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isMatch = await bcryptjs.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to verify password');
  }
}

/* ============================================
   Token Functions
   ============================================ */

export function createToken(partner: Partner): string {
  const payload = {
    id: partner.id,
    partnerId: partner.partnerId,
    email: partner.email,
    firstName: partner.firstName,
    lastName: partner.lastName,
    isAdmin: partner.isAdmin || false,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });

  return token;
}

export async function verifyToken(token: string): Promise<Partner | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      partnerId: string;
      email: string;
      firstName: string;
      lastName: string;
      isAdmin?: boolean;
    };

    // Return a partial partner object with verified data
    return {
      id: decoded.id,
      partnerId: decoded.partnerId,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      isAdmin: decoded.isAdmin,
      passwordHash: '', // Not included in token
      approved: true, // Verified tokens are approved
      createdAt: new Date().toISOString(),
    } as Partner;
  } catch (error) {
    return null;
  }
}

/* ============================================
   Session Functions
   ============================================ */

export function getSessionFromRequest(request: NextRequest): string | null {
  const sessionCookie = request.cookies.get('ndps-session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  return sessionCookie.value;
}

export async function getPartnerFromRequest(request: NextRequest): Promise<Partner | null> {
  const token = getSessionFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}
