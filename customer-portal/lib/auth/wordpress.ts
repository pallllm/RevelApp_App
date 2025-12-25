import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export interface WordPressJWTPayload {
  data: {
    user: {
      id: number;
      user_email: string;
      user_nicename: string;
      user_display_name: string;
    };
  };
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  wordpressUserId: number;
  email: string;
  name: string;
  role: string;
  facilityId: string;
}

/**
 * WordPress JWT トークンを検証してユーザー情報を取得
 */
export async function verifyWordPressToken(
  authHeader: string | null
): Promise<AuthenticatedUser> {
  // 開発環境でのみモックトークンを許可（WordPress REST API問題の一時的な回避策）
  if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer dev-token') {
    console.warn('⚠️  WARNING: Using development mock token! This should NEVER be used in production.');

    // テストユーザー（スタッフ）を返す
    const user = await prisma.user.findUnique({
      where: { id: 'test-user-staff-001' },
      include: { facility: true },
    });

    if (user && user.status === 'ACTIVE') {
      return {
        id: user.id,
        wordpressUserId: user.wordpressUserId!,
        email: user.email,
        name: user.name,
        role: user.role,
        facilityId: user.facilityId,
      };
    }

    throw new Error('Development test user not found in database');
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authentication token provided');
  }

  const token = authHeader.substring(7); // "Bearer " を除去

  // WordPress JWT シークレットで検証
  const wordpressJwtSecret = process.env.WORDPRESS_JWT_SECRET;
  if (!wordpressJwtSecret) {
    throw new Error('WORDPRESS_JWT_SECRET is not configured');
  }

  try {
    // JWT トークンをデコード・検証
    const decoded = jwt.verify(token, wordpressJwtSecret) as WordPressJWTPayload;

    // データベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { wordpressUserId: decoded.data.user.id },
      include: {
        facility: true,
      },
    });

    if (!user) {
      throw new Error('User not found in database');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('User account is not active');
    }

    return {
      id: user.id,
      wordpressUserId: user.wordpressUserId!,
      email: user.email,
      name: user.name,
      role: user.role,
      facilityId: user.facilityId,
    };
  } catch (error) {
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
 * 認証ヘッダーからトークンを抽出
 */
export function extractTokenFromHeader(headers: Headers): string | null {
  return headers.get('authorization');
}

/**
 * ロール権限チェック
 */
export function hasRole(user: AuthenticatedUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * 施設所有権チェック
 */
export function belongsToFacility(user: AuthenticatedUser, facilityId: string): boolean {
  return user.facilityId === facilityId;
}
