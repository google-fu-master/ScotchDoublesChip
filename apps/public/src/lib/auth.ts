import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  type: 'player' | 'td' | 'admin';
  isVerified: boolean;
}

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Extract and verify JWT token from request
 */
export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies for web clients
  const tokenCookie = request.cookies.get('auth_token');
  return tokenCookie?.value || null;
}

/**
 * Verify JWT token and return user data
 */
export function verifyAuthToken(token: string): AuthUser {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AuthError('JWT secret not configured', 500);
    }

    const payload = jwt.verify(token, secret) as any;
    
    return {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
      isVerified: payload.isVerified ?? false,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired', 401);
    }
    throw new AuthError('Authentication failed', 401);
  }
}

/**
 * Get authenticated user from request (returns null if not authenticated)
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return null;
    }
    return verifyAuthToken(token);
  } catch (error) {
    console.warn('Auth verification failed:', error);
    return null;
  }
}

/**
 * Require authentication for API route
 */
export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);
  if (!user) {
    throw new AuthError('Authentication required');
  }
  return user;
}

/**
 * Require specific user type for API route
 */
export function requireAuthType(request: NextRequest, requiredType: AuthUser['type']): AuthUser {
  const user = requireAuth(request);
  
  // Admin can access everything
  if (user.type === 'admin') {
    return user;
  }
  
  if (user.type !== requiredType) {
    throw new AuthError(`Access denied. Required role: ${requiredType}`, 403);
  }
  
  return user;
}

/**
 * Middleware wrapper for API routes with authentication
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthUser, ...args: T) => Promise<NextResponse>,
  requiredType?: AuthUser['type']
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const user = requiredType 
        ? requireAuthType(request, requiredType)
        : requireAuth(request);
      
      return await handler(request, user, ...args);
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional authentication wrapper (doesn't fail if no auth)
 */
export function withOptionalAuth<T extends any[]>(
  handler: (request: NextRequest, user: AuthUser | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const user = getAuthUser(request);
    return await handler(request, user, ...args);
  };
}