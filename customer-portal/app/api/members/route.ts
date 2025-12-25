import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/members
 * 新しい利用者を追加
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, initials, startDate } = body;

    // バリデーション
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // 開発環境では固定のfacilityIdを使用
    // 本番環境ではJWTトークンから取得
    const DEV_FACILITY_ID = 'test-facility-1';

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // 新しい利用者を作成
    const newMember = await prisma.user.create({
      data: {
        facilityId: DEV_FACILITY_ID,
        role: 'MEMBER',
        email,
        name,
        initials: initials || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      member: {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        initials: newMember.initials,
        role: newMember.role,
        startDate: newMember.startDate?.toISOString(),
        status: newMember.status,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
  }
}
