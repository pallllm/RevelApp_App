import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/seed/games/cleanup
 * 既存のゲームデータをクリーンアップ（開発環境のみ）
 */
export async function DELETE() {
  // 開発環境でのみ実行可能
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const DEV_USER_ID = 'test-user-staff-001';

    // 開発用ユーザーを取得してfacilityIdを取得
    const user = await prisma.user.findUnique({
      where: { id: DEV_USER_ID },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Development user not found' },
        { status: 400 }
      );
    }

    const facilityId = user.facilityId;

    // FacilityGameを削除
    const deletedFacilityGames = await prisma.facilityGame.deleteMany({
      where: {
        facilityId: facilityId,
      },
    });

    // すべてのGameを削除
    const deletedGames = await prisma.game.deleteMany({});

    return NextResponse.json({
      message: 'Successfully cleaned up game data',
      deletedFacilityGames: deletedFacilityGames.count,
      deletedGames: deletedGames.count,
    });
  } catch (error) {
    console.error('Failed to cleanup games:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup games' },
      { status: 500 }
    );
  }
}
