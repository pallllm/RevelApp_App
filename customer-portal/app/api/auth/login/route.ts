import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/login
 * 独自認証でログイン（メールアドレス + パスワード）
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // データベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            planType: true,
          },
        },
      },
    });

    // ユーザーが存在しない、またはパスワードが設定されていない
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // ユーザーのステータスチェック
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'このアカウントは無効化されています。管理者にお問い合わせください。' },
        { status: 403 }
      );
    }

    // STAFF ロールのみログイン可能（MEMBER は施設が管理する利用者なのでログイン不可）
    if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'ログイン権限がありません' },
        { status: 403 }
      );
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // JWT トークンを生成
    const jwtSecret = process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        facilityId: user.facilityId,
      },
      jwtSecret,
      { expiresIn: '7d' } // 7日間有効
    );

    // ログイン成功レスポンス
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        facility: {
          id: user.facility.id,
          name: user.facility.name,
          planType: user.facility.planType,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'ログイン処理中にエラーが発生しました'
      },
      { status: 500 }
    );
  }
}
