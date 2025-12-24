import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ApiError } from './errorHandler';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    wordpressUserId: number;
    email: string;
    role: string;
    facilityId: string;
  };
}

/**
 * WordPress JWT認証ミドルウェア
 * WordPressから発行されたJWTトークンを検証
 */
export const authenticateWordPressToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Authorization ヘッダーからトークン取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.substring(7); // "Bearer " を除去

    // WordPress JWT検証
    const wordpressUrl = process.env.WORDPRESS_URL;
    const wordpressJwtSecret = process.env.WORDPRESS_JWT_SECRET;

    if (!wordpressUrl || !wordpressJwtSecret) {
      throw new Error('WordPress configuration missing');
    }

    // JWTトークンをデコード・検証
    const decoded = jwt.verify(token, wordpressJwtSecret) as any;

    // WordPressのユーザー情報を取得（オプション: 追加検証が必要な場合）
    // const wpUser = await axios.get(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });

    // データベースからユーザー情報を取得
    // TODO: Prismaクライアントで実際のユーザー情報を取得
    // const user = await prisma.user.findUnique({
    //   where: { wordpressUserId: decoded.data.user.id }
    // });

    // リクエストにユーザー情報を追加（仮）
    req.user = {
      id: 'temp-user-id', // TODO: DBから取得
      wordpressUserId: decoded.data.user.id,
      email: decoded.data.user.user_email,
      role: 'STAFF', // TODO: DBから取得
      facilityId: 'temp-facility-id', // TODO: DBから取得
    };

    logger.debug('User authenticated', { userId: req.user.id });
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * ロール認可ミドルウェア
 * 特定のロールのみアクセスを許可
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'You do not have permission to perform this action')
      );
    }

    next();
  };
};
