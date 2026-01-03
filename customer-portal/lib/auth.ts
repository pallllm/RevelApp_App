/**
 * JWT認証ユーティリティ
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  facilityId: string | null;
}

/**
 * リクエストからJWTトークンを取得して検証
 *
 * @param request Next.js リクエストオブジェクト
 * @returns JWTペイロード、または null（無効な場合）
 */
export function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // "Bearer " を削除

    const jwtSecret = process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production';

    // トークンを検証
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 認証が必要なエンドポイント用のヘルパー
 * トークンが無効な場合はエラーレスポンスを返す
 *
 * @param request Next.js リクエストオブジェクト
 * @returns [payload, null] または [null, errorResponse]
 */
export function requireAuth(request: NextRequest): [JWTPayload, null] | [null, Response] {
  const payload = verifyToken(request);

  if (!payload) {
    return [
      null,
      Response.json(
        { error: '認証が必要です。ログインしてください。' },
        { status: 401 }
      ),
    ];
  }

  return [payload, null];
}
