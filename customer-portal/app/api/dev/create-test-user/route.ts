export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/dev/create-test-user
 * テストユーザーを作成（開発環境のみ）
 */
export async function POST(request: NextRequest) {
  // 本番環境では無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'この機能は本番環境では使用できません' },
      { status: 403 }
    );
  }

  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('password123', 10);

    // テスト施設を作成（既に存在する場合はスキップ）
    const facility = await prisma.facility.upsert({
      where: { id: 'test-facility-001' },
      update: {},
      create: {
        id: 'test-facility-001',
        name: 'テスト施設A',
        planType: 'FOCUS',
        email: 'test-facility@revelapp.jp',
        phone: '03-1234-5678',
        address: '東京都渋谷区テスト1-2-3',
        latitude: 35.6812,
        longitude: 139.7671,
      },
    });

    // テストユーザー（STAFF）を作成
    const user = await prisma.user.upsert({
      where: { email: 'test@revelapp.jp' },
      update: {
        password: hashedPassword,
      },
      create: {
        id: 'test-user-staff-002',
        facilityId: facility.id,
        role: 'STAFF',
        email: 'test@revelapp.jp',
        password: hashedPassword,
        name: 'テスト太郎',
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'テストユーザーを作成しました',
      credentials: {
        email: user.email,
        password: 'password123',
        role: user.role,
        facility: facility.name,
      },
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'テストユーザーの作成に失敗しました'
      },
      { status: 500 }
    );
  }
}
