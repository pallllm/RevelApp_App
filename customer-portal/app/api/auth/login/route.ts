import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/login
 * WordPress JWTでログイン
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    }

    // WordPress JWT認証エンドポイントURL
    const wordpressApiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;

    if (!wordpressApiUrl) {
      console.error('WORDPRESS_API_URL or NEXT_PUBLIC_WORDPRESS_URL is not configured');
      return NextResponse.json(
        { error: 'サーバー設定エラー。管理者にお問い合わせください。' },
        { status: 500 }
      );
    }

    // WordPress JWT認証エンドポイントにログインリクエストを送信
    const jwtEndpoint = `${wordpressApiUrl}/wp-json/jwt-auth/v1/token`;

    console.log(`Attempting WordPress login at: ${jwtEndpoint}`);

    const wordpressResponse = await fetch(jwtEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!wordpressResponse.ok) {
      const errorData = await wordpressResponse.json().catch(() => ({}));
      console.error('WordPress authentication failed:', errorData);

      return NextResponse.json(
        { error: errorData.message || 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const wordpressData = await wordpressResponse.json();

    // WordPressから返されたトークンとユーザー情報
    const { token, user_email, user_nicename, user_display_name } = wordpressData;

    if (!token) {
      console.error('No token received from WordPress');
      return NextResponse.json(
        { error: 'トークンの取得に失敗しました' },
        { status: 500 }
      );
    }

    // データベースからユーザー情報を取得（WordPress IDでマッチング）
    // WordPressから返されるユーザーIDを使用する場合は、wordpressDataにIDが含まれている必要があります
    const user = await prisma.user.findFirst({
      where: {
        email: user_email,
        status: 'ACTIVE',
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

    if (!user) {
      console.error(`User not found in database for email: ${user_email}`);
      return NextResponse.json(
        { error: 'ユーザー情報が見つかりません。管理者にお問い合わせください。' },
        { status: 404 }
      );
    }

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
