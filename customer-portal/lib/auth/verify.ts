import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  facilityId: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  facilityId: string;
}

/**
 * リクエストから認証トークンを検証してユーザー情報を取得
 * 独自JWT認証とWordPress JWT認証の両方に対応
 */
export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization');

  // 開発環境でのモックトークン
  if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer dev-token') {
    console.warn('⚠️  WARNING: Using development mock token!');
    const user = await prisma.user.findFirst({
      where: {
        role: { in: ['STAFF', 'ADMIN'] },
        status: 'ACTIVE',
      },
    });

    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        facilityId: user.facilityId,
      };
    }
    throw new Error('No test user found');
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.substring(7);

  // 独自JWTシークレット
  const jwtSecret = process.env.NEXTAUTH_SECRET;
  if (!jwtSecret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  try {
    // まず独自JWTとして検証を試みる
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // ユーザー情報をDBから取得（最新の状態を確認）
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      facilityId: user.facilityId,
    };
  } catch (error) {
    // 独自JWTの検証が失敗した場合、WordPress JWTを試みる
    const wordpressSecret = process.env.WORDPRESS_JWT_SECRET;
    if (wordpressSecret) {
      try {
        const wpDecoded = jwt.verify(token, wordpressSecret) as {
          data: { user: { id: number } };
        };

        const user = await prisma.user.findUnique({
          where: { wordpressUserId: wpDecoded.data.user.id },
        });

        if (user && user.status === 'ACTIVE') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            facilityId: user.facilityId,
          };
        }
      } catch {
        // WordPress JWT も失敗
      }
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid authentication token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Authentication token has expired');
    }
    throw error;
  }
}

/**
 * 管理者権限チェック
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === 'ADMIN';
}

/**
 * スタッフ以上の権限チェック
 */
export function isStaffOrAbove(user: AuthenticatedUser): boolean {
  return user.role === 'STAFF' || user.role === 'ADMIN';
}
